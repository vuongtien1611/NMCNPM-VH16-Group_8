import { fetchData } from "../apis/api.js";
import { createSummary } from "../components/summary.js";
import { commonTable } from "../components/table.js";

const setStatus = (_, row) => {
    const status = {
        done: ["Hoàn thành", "completed"],
        pending: ["Chờ xử lý", "pending"],
        cancel: ["Đã hủy", "cancelled"],
        cancelled: ["Đã hủy", "cancelled"],
        delivering: ["Đang giao", "shipping"],
    };

    const current = status[row.status] || ["Không xác định", "unknown"];
    return `<span class="badge ${current[1]}">${current[0]}</span>`;
};

const maskPhone = (phone) => {
    const value = String(phone || "");
    if (value.length <= 4) return "xxxx";
    return `${value.slice(0, -4)}xxxx`;
};

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
        return { ...order, payment: order.amount * (order.product?.price || 0) };
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
                `<div><strong>${row.customer?.name || ""}</strong><br><small>${maskPhone(row.customer?.phone)}</small></div>`,
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
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            render: setStatus,
        },
        {
            title: "Thao Tác",
            dataIndex: "id",
            render: (value, row) => {
                const fragment = document.createDocumentFragment();

                if (row.status === "pending" || row.status === "delivering") {
                    const editBtn = document.createElement("button");
                    editBtn.className = "btn-action btn-icon edit";
                    editBtn.innerHTML = `<i class="fas fa-check"></i>`;

                    editBtn.addEventListener("click", async () => {
                        const isUpdate = confirm("bạn muốn update tiến độ không?");
                        if (!isUpdate) return;

                        const nextStatus = row.status === "pending" ? "delivering" : "done";

                        editBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                        editBtn.style.pointerEvents = "none";

                        const res = await fetchData.update("orders", {
                            id: row.id,
                            customerId: row.customer?.id,
                            productId: row.product?.id,
                            amount: row.amount,
                            status: nextStatus,
                        });

                        if (res) {
                            const oldContainer = editBtn.closest(".order-page");
                            await rerenderOrder(oldContainer);
                        } else {
                            editBtn.innerHTML = `<i class="fas fa-check"></i>`;
                            editBtn.style.pointerEvents = "auto";
                        }
                    });

                    fragment.append(editBtn);
                }

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
       <a href="#/order/create" class="btn-add"><i class="fas fa-plus"></i> Thêm đơn hàng mới</a>
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
    </section>
  `;

    const tableWrapper = container.querySelector(".table-wrapper");
    const statsWrapper = container.querySelector(".stats-wrapper");
    const searchInput = container.querySelector(".search-bar input");
    const tabs = container.querySelectorAll(".tab");

    let activeStatus = "all";

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

    renderSummary();
    renderTable();

    return container;
}
