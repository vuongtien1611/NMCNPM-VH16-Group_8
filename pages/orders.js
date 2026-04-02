import { fetchData } from "../apis/api.js";
import { createSummary } from "../components/summary.js";
import { commonTable } from "../components/table.js";
import { getStatus, getStatusColor, formatVND, formatAndMaskPhone } from "../utils.js";

// Order Page Cường
const rerenderOrder = async (oldContainer) => {
    const app = document.querySelector("#app");
    if (!app) return;

    const newContainer = await order();

    if (oldContainer && oldContainer.parentNode) {
        oldContainer.replaceWith(newContainer);
    } else {
        app.innerHTML = "";
        app.appendChild(newContainer);
    }
};

const formatNumber = (value) => {
    return new Number(value) || 0;
};

const getSummaryList = (orders) => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((item) => item.status === "pending").length;
    const doneOrders = orders.filter((item) => item.status === "done").length;
    const cancelOrders = orders.filter((item) => item.status === "cancel" || item.status === "cancelled").length;

    return [
        {
            cardColor: "blue",
            title: "TỔNG ĐƠN HÀNG",
            value: formatNumber(totalOrders),
        },
        {
            cardColor: "orange",
            title: "ĐANG XỬ LÝ",
            value: formatNumber(pendingOrders),
        },
        {
            cardColor: "green",
            title: "THÀNH CÔNG",
            value: formatNumber(doneOrders),
        },
        {
            cardColor: "red",
            title: "ĐÃ HỦY",
            value: formatNumber(cancelOrders),
        },
    ];
};

export async function order() {
    const getOrders = await fetchData.get("orders");
    const orders = (getOrders || []).map((order) => {
        return {
            ...order,
            payment: order.amount * (order.product?.price || 0),
        };
    });

    const columns = [
        {
            title: "Mã đơn hàng",
            dataIndex: "id",
        },
        {
            title: "Khách hàng",
            dataIndex: "customer",
            render: (_, row) =>
                `<div><strong>${row.customer?.name || ""}</strong><br><small>${formatAndMaskPhone(row.customer?.phone)}</small></div>`,
        },
        {
            title: "Sản phẩm",
            dataIndex: "product",
            render: (_, row) => {
                return row.product?.name || "";
            },
        },
        {
            title: "Số lượng",
            dataIndex: "amount",
        },
        {
            title: "Tổng tiền",
            dataIndex: "payment",
            render: (_, row) => {
                return formatVND(row.payment);
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            render: (_, row) => {
                const value = row.status;
                return `<span class="status ${getStatusColor(value)}">${getStatus(value).toUpperCase()}</span>`;
            },
        },
        {
            title: "Thao Tác",
            dataIndex: "id",
            render: (value, row) => {
                const fragment = document.createDocumentFragment();

                const editBtn = document.createElement("button");
                editBtn.className = "btn-action btn-icon edit";
                editBtn.innerHTML = `<i class="fas fa-check"></i>`;

                editBtn.addEventListener("click", () => {
                    currentOrder = row;
                    modalDescription.textContent = `Đơn hàng #${row.id} - trạng thái hiện tại: ${getStatus(row.status)}`;
                    statusSelect.value = row.status || "pending";
                    quantityInput.value = row.amount ?? 1;
                    if (row.status !== "pending") {
                        quantityInput.disabled = true;
                        quantityNote.textContent = "Chỉ có thể chỉnh số lượng khi đơn hàng đang ở trạng thái pending.";
                    } else {
                        quantityInput.disabled = false;
                        quantityNote.textContent = "";
                    }
                    orderModal.classList.add("active");
                });
                fragment.append(editBtn);

                const deleteBtn = document.createElement("button");
                deleteBtn.className = "btn-action btn-icon delete";
                deleteBtn.innerHTML = `<i class="fas fa-trash"></i>`;

                deleteBtn.addEventListener("click", async () => {
                    if (!confirm("Bạn có chắc muốn xóa?")) return;

                    deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                    deleteBtn.style.pointerEvents = "none";

                    const res = await fetchData.delete("orders", value);

                    if (res) {
                        const oldContainer = deleteBtn.closest(".order-page");
                        await rerenderOrder(oldContainer);
                    } else {
                        deleteBtn.innerHTML = `<i class="fas fa-trash"></i>`;
                        deleteBtn.style.pointerEvents = "auto";
                    }
                });

                fragment.append(deleteBtn);
                return fragment;
            },
        },
    ];

    const container = document.createElement("div");
    container.className = "order-page";
    container.innerHTML = `
    <header class="header">
      <div class="search-bar">
        <input type="text" placeholder="Tìm mã đơn, khách hàng, SĐT, sản phẩm...">
      </div>
       <a href="#/orders/create" class="btn-add"><i class="fas fa-plus"></i> Thêm đơn hàng mới</a>
    </header>
    <div class="stats-wrapper"></div>
    <section class="table-container">
      <div class="table-header">
        <div class="tabs">
          <button class="tab active" data-status="all">Tất cả</button>
          <button class="tab" data-status="pending">Chờ xử lý</button>
          <button class="tab" data-status="delivering">Đang giao</button>
          <button class="tab" data-status="done">Đã xong</button>
        </div>
      </div>
      <div class="table-wrapper"></div>
    </section>`;

    // thêm vào phần sửa số lượng và trạng thái
    container.innerHTML += `<div class="modal order-modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div class="modal-card">
        <h2 id="modalTitle" class="modal-title">Cập nhật trạng thái</h2>
        <p class="modal-description"></p>
        <label class="modal-label" for="statusSelect">Trạng thái mới</label>
        <select id="statusSelect" class="status-select">
          <option value="pending">Chờ xử lý</option>
          <option value="delivering">Đang giao</option>
          <option value="done">Đã xong</option>
          <option value="cancel">Hủy</option>
        </select>
        <label class="modal-label" for="quantityInput">Số lượng</label>
        <input id="quantityInput" class="quantity-input" type="number" min="1" />
        <p class="modal-note"></p>
        <div class="modal-actions">
          <button type="button" class="btn btn-cancel">Hủy</button>
          <button type="button" class="btn btn-save">Lưu</button>
        </div>
      </div>
    </div>

  `;

    const tableWrapper = container.querySelector(".table-wrapper");
    const statsWrapper = container.querySelector(".stats-wrapper");
    const searchInput = container.querySelector(".search-bar input");
    const tabs = container.querySelectorAll(".tab");

    const orderModal = container.querySelector(".order-modal");
    const modalDescription = container.querySelector(".modal-description");
    const statusSelect = container.querySelector("#statusSelect");
    const quantityInput = container.querySelector("#quantityInput");
    const quantityNote = container.querySelector(".modal-note");
    const btnModalCancel = container.querySelector(".btn-cancel");
    const btnModalSave = container.querySelector(".btn-save");

    let activeStatus = "all";
    let currentOrder = null;

    const normalize = (value) =>
        String(value || "")
            .toLowerCase()
            .trim();

    const filterOrders = () => {
        const keyword = normalize(searchInput.value);

        return orders.filter((row) => {
            const matchStatus = activeStatus === "all" ? true : row.status === activeStatus;

            const searchText = [row.id, row.customer?.name, row.customer?.phone, row.product?.name, row.status].map(normalize).join(" ");

            const matchKeyword = !keyword || searchText.includes(keyword);

            return matchStatus && matchKeyword;
        });
    };

    const renderSummary = () => {
        statsWrapper.innerHTML = "";
        const summarySection = createSummary(getSummaryList(orders));
        statsWrapper.appendChild(summarySection);
    };

    const renderTable = () => {
        const filteredOrders = filterOrders();
        tableWrapper.innerHTML = "";
        commonTable(tableWrapper, columns, filteredOrders);
    };

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            activeStatus = tab.dataset.status;

            tabs.forEach((item) => item.classList.remove("active"));
            tab.classList.add("active");

            renderTable();
        });
    });

    searchInput.addEventListener("input", () => {
        renderTable();
    });

    const closeModal = () => {
        currentOrder = null;
        orderModal.classList.remove("active");
    };

    btnModalCancel.addEventListener("click", () => {
        closeModal();
    });

    btnModalSave.addEventListener("click", async () => {
        if (!currentOrder) return;

        const nextStatus = statusSelect.value;
        const previousAmount = Number(currentOrder.amount) || 0;
        const requestedAmount = Number(quantityInput.value) || previousAmount;
        const isPending = currentOrder.status === "pending";

        if (isPending) {
            if (requestedAmount <= 0) {
                alert("Số lượng phải lớn hơn 0");
                return;
            }

            const remaining = Number(currentOrder.product?.remaining || 0);
            const difference = requestedAmount - previousAmount;
            if (difference > remaining) {
                alert(`Số lượng vượt quá tồn kho. Chỉ còn ${remaining} sản phẩm.`);
                return;
            }
        }

        if (!nextStatus || (nextStatus === currentOrder.status && requestedAmount === previousAmount)) {
            return closeModal();
        }

        btnModalSave.disabled = true;
        btnModalSave.textContent = "Đang lưu...";

        const orderPayload = {
            id: currentOrder.id,
            customerId: currentOrder.customer?.id,
            productId: currentOrder.product?.id,
            amount: requestedAmount,
            status: nextStatus,
        };

        const orderResult = await fetchData.update("orders", orderPayload);

        if (!orderResult) {
            btnModalSave.disabled = false;
            btnModalSave.textContent = "Lưu";
            return;
        }

        if (isPending && requestedAmount !== previousAmount) {
            const product = currentOrder.product || {};
            const remaining = Number(product.remaining || 0);
            const updatedProductPayload = {
                categoryId: product.category?.id || 0,
                name: product.name,
                sku: product.sku || "",
                price: product.price,
                remaining: remaining - (requestedAmount - previousAmount),
                imageId: product.imageId || "",
                id: product.id,
            };

            const productResult = await fetchData.update("products", updatedProductPayload);
            if (!productResult) {
                alert("Cập nhật số lượng sản phẩm thất bại. Vui lòng thử lại.");
                btnModalSave.disabled = false;
                btnModalSave.textContent = "Lưu";
                return;
            }
        }

        btnModalSave.disabled = false;
        btnModalSave.textContent = "Lưu";
        closeModal();

        const oldContainer = container;
        await rerenderOrder(oldContainer);
    });

    renderSummary();
    renderTable();

    return container;
}

// Order page (Hiếu)
// {import { fetchData } from "../apis/api.js";
// import { createFilter } from "../components/filter.js";
// import { createSummary } from "../components/summary.js";
// import { commonTable } from "../components/table.js";
// import {
//     getStatus,
//     getStatusColor,
//     formatAndMaskPhone,
//     formatVND,
//     createActionButtons,
// } from "../utils.js";

// export async function order() {
//     const container = document.createElement("div");
//     container.innerHTML = `
//         <header class="header">
//             <div class="search-bar">
//                 <input type="text" placeholder="Tìm mã đơn, tên khách hàng...">
//             </div>
//             <a href="#/orders/create" class="btn-add"><i class="fa-solid fa-cart-arrow-down"></i> Thêm đơn hàng</a>
//         </header>
//         <div class="stats-wrapper"></div>
//         <section class="table-container">
//             <div class="table-header">
//                 <div id="tabFilter" class="tabs">
//                     <button class="tab active" data-value="ALL">Tất cả</button>
//                     <button class="tab" data-value="PENDING">Chờ xử lý</button>
//                     <button class="tab" data-value="DELIVERING">Đang giao</button>
//                     <button class="tab" data-value="DONE">Đã xong</button>
//                 </div>
//                 <div class ="data-filter">
//                     <input  type="date" id="dateFilter" style="padding: 8px; border-radius: 5px; border: 1px solid #ddd;">
//                 </div>
//             </div>
//             <div class="table-wrapper"></div>
//         </section>
//     `;

//     const tableWrapper = container.querySelector(".table-wrapper");
//     const statsWrapper = container.querySelector(".stats-wrapper");
//     const searchInput = container.querySelector(".search-bar input");
//     const tab = container.querySelector("#tabFilter");

//     async function loadAndRender() {
//         const orders = await fetchData.get("orders");

//         const columns = [
//             {
//                 title: "Mã đơn",
//                 dataIndex: "id",
//                 render: (value) => `<strong>#ORD-${value}</strong>`,
//             },
//             {
//                 title: "Khách hàng",
//                 dataIndex: "customer",
//                 render: (value) => {
//                     return `
//                         ${value.name}<br>
//                         <small>${formatAndMaskPhone(value.phone)}</small>
//                     `;
//                 },
//             },
//             {
//                 title: "Sản phẩm",
//                 dataIndex: "product",
//                 render: (value) => value.name,
//             },
//             {
//                 title: "Số lượng / Giá tiền",
//                 render: (_, row) => {
//                     const amount = row.amount;
//                     const price = row.product.price;
//                     return `${amount} x ${formatVND(price)}`;
//                 },
//             },
//             {
//                 title: "Tổng tiền",
//                 render: (_, row) => {
//                     const total = row.product.price * row.amount;
//                     return formatVND(total);
//                 },
//             },
//             {
//                 title: "Trạng thái",
//                 dataIndex: "status",
//                 render: (value) =>
//                     `<span class="status ${getStatusColor(value)}">${getStatus(value).toUpperCase()}</span>`,
//             },
//             {
//                 title: "Thao tác",
//                 dataIndex: "id",
//                 render: (value) =>
//                     createActionButtons({
//                         id: value,
//                         endpoint: "orders",
//                         onSuccess: loadAndRender,
//                     }),
//             },
//         ];

//         commonTable(tableWrapper, columns, orders);

//         statsWrapper.innerHTML = "";

//         const totalOrder = orders?.length || 0;
//         const penidngOrder =
//             orders?.filter((o) => o.status === "pending").length || 0;
//         const doneOrder =
//             orders?.filter((o) => o.status === "done").length || 0;
//         const cancelOrder =
//             orders?.filter((o) => o.status === "cancel").length || 0;

//         const summaryEl = createSummary([
//             {
//                 title: "Tổng đơn hàng",
//                 value: totalOrder,
//                 cardColor: "blue",
//             },
//             {
//                 title: "Đang xử lý",
//                 value: penidngOrder,
//                 cardColor: "orange",
//             },
//             { title: "Thành công", value: doneOrder, cardColor: "green" },
//             { title: "Đã hủy", value: cancelOrder, cardColor: "red" },
//         ]);
//         statsWrapper.appendChild(summaryEl);

//         const formatOrders = orders.map((order) => ({
//             ...order,
//             customerName: order.customer?.name || "N/A",
//         }));

//         createFilter({
//             data: formatOrders,
//             searchFields: ["customerName", "id"],
//             searchEl: searchInput,
//             filterEl: tab,
//             getFilterValue: (item, val) =>
//                 val === "ALL" ? true : item.status?.toUpperCase() === val,
//             render: (filteredData) => {
//                 tableWrapper.innerHTML = "";
//                 commonTable(tableWrapper, columns, filteredData);
//             },
//         });
//     }

//     await loadAndRender();

//     return container;
// }
// }
