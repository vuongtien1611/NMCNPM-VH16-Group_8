import { fetchData } from "../apis/api.js";
import { createSummary } from "../components/summary.js";
import { commonTable } from "../components/table.js";
import { getStatus, getStatusColor, formatVND } from "../utils.js";

export async function home() {
    const container = document.createElement("div");
    container.innerHTML = ` <header class="header"> <div class="user"> <strong>Admin</strong> <i class="fas fa-user-circle"></i> </div> </header> <div class="stats-wrapper"></div> <section class="table-container"> <div class="table-header"> <h3>Đơn hàng gần đây</h3> </div> <div class="table-wrapper"></div> </section> `;
    const statsWrapper = container.querySelector(".stats-wrapper");
    const tableWrapper = container.querySelector(".table-wrapper");
    async function loadAndRender() {
        const orders = await fetchData.get("orders");
        const columns = [
            {
                title: "Mã đơn",
                dataIndex: "id",
                render: (value) => `<strong>#${value}</strong>`,
            },
            {
                title: "Khách hàng",
                dataIndex: "customer",
                render: (value) => `<strong>${value.name}</strong>`,
            },
            {
                title: "Trạng thái",
                dataIndex: "status",
                render: (value) =>
                    `<span class="status ${getStatusColor(value)}">${getStatus(value).toUpperCase()}</span>`,
            },
            {
                title: "Tổng tiền",
                render: (_, row) => {
                    const total = row.product.price * row.amount;
                    return formatVND(total);
                },
            },
        ];
        commonTable(tableWrapper, columns, orders);
        statsWrapper.innerHTML = "";
        const total = orders.reduce((total, order) => {
            return total + order.product.price * order.amount;
        }, 0);
        const newOrder = orders?.length || 0;
        const summaryEl = createSummary([
            {
                title: "Doanh thu",
                value: formatVND(total),
                cardColor: "no-border-left",
            },
            { title: "Đơn mới", value: newOrder, cardColor: "no-border-left" },
        ]);
        statsWrapper.appendChild(summaryEl);
    }
    await loadAndRender();
    return container;
}
