import { fetchData } from "../apis/api.js";
import { createFilter } from "../components/filter.js";
import { createSummary } from "../components/summary.js";
import { commonTable } from "../components/table.js";
import {
    createActionButtons,
    formatAndMaskPhone,
    formatVND,
    getRankColor,
    getRankVN,
} from "../utils.js";

export async function customer() {
    function calctotalSpending(orders, customerId) {
        const userOrders = orders.filter(
            (order) => Number(order.customer?.id) === Number(customerId),
        );

        const total = userOrders.reduce((sum, order) => {
            const orderTotal =
                Number(order.amount || 0) * Number(order.product?.price || 0);
            return sum + orderTotal;
        }, 0);

        return total;
    }

    const container = document.createElement("div");
    container.innerHTML = `
            <header class="header">
              <div class="search-bar">
                <input type="text" placeholder="Tìm tên, email hoặc số điện thoại...">
              </div>
              <a href="#/customers/create" class="btn-add"><i class="fas fa-user-plus"></i> Thêm khách hàng</a>
            </header>
      
            <div class="stats-wrapper">
            </div>
      
            <section class="table-container">
              <div class="table-header">
                <h3>Danh sách khách hàng</h3>
                <div>
                    <label>Hạng:</label>
                    <select style="padding: 8px; border-radius: 5px; border: 1px solid #ddd;">
                      <option value="ALL">Tất cả</option>
                      <option value="GOLD">Vàng</option>
                      <option value="SILVER">Bạc</option>
                      <option value="BRONZE">Đồng</option>
                    </select>
                </div>
              </div>
              <div class="table-wrapper"></div>
            </section>
        `;

    const tableWrapper = container.querySelector(".table-wrapper");
    const statsWrapper = container.querySelector(".stats-wrapper");
    const searchInput = container.querySelector(".search-bar input");
    const select = container.querySelector("select");

    async function loadAndRender() {
        const [customers, orders] = await Promise.all([
            fetchData.get("customers"),
            fetchData.get("orders"),
        ]);

        const columns = [
            {
                title: "Khách hàng",
                dataIndex: "name",
                render: (_, row) => {
                    const initials = row.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase();
                    const bgColor = "#f0f0f0";
                    const textColor = "#333";
                    return `
              <div class="cust-info">
                <div class="avatar" style="background: ${bgColor}; color: ${textColor};">
                  ${initials}
                </div>
                <div>
                  <strong>${row.name}</strong><br>
                  <small>ID: ${row.id}</small>
                </div>
              </div>
            `;
                },
            },
            {
                title: "Liên hệ",
                dataIndex: "email",
                render: (_, row) =>
                    `${row.email}<br><small>${formatAndMaskPhone(row.phone)}</small>`,
            },
            {
                title: "Hạng",
                dataIndex: "rank",
                render: (_, row) =>
                    `<span class="tier ${getRankColor(row.rank)}">${getRankVN(row.rank)}</span>`,
            },
            { title: "Địa chỉ", dataIndex: "address" },
            {
                title: "Tổng chi tiêu",
                dataIndex: "totalSpending",
                render: (_, row) => {
                    const id = row.id;
                    const totalSpending = calctotalSpending(orders, id);

                    return formatVND(totalSpending);
                },
            },
            {
                title: "Thao tác",
                dataIndex: "id",
                render: (value) =>
                    createActionButtons({
                        id: value,
                        endpoint: "customers",
                        onSuccess: loadAndRender,
                    }),
            },
        ];

        commonTable(tableWrapper, columns, customers);

        const summaryList = [
            {
                cardColor: "no-border-left",
                title: "Tổng khách hàng",
                value: customers?.length || 0,
            },
            {
                cardColor: "no-border-left",
                title: "Khách hàng mới",
                value: customers?.length || 0,
            },
            {
                cardColor: "no-border-left",
                title: "Tỉ lệ quay lại",
                value: `${customers?.length || 0}%`,
            },
        ];

        statsWrapper.innerHTML = "";
        const summaryEl = createSummary(summaryList);
        statsWrapper.appendChild(summaryEl);

        createFilter({
            data: customers,
            searchFields: ["name", "email", "phone"],
            searchEl: searchInput,
            filterEl: select,

            getFilterValue: (item, value) =>
                value === "ALL" ? true : item.rank?.toUpperCase() === value,
            render: (filteredData) => {
                tableWrapper.innerHTML = "";
                commonTable(tableWrapper, columns, filteredData);
            },
        });
    }

    await loadAndRender();
    return container;
}
