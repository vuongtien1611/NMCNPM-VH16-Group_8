// Create report (Huy)
import { fetchData } from "../apis/api.js";

// HELPERS
function calcRevenue(order) {
    return (order.amount ?? 0) * (order.product?.price ?? 0);
}

function formatVND(value) {
    return Number(value).toLocaleString("vi-VN") + "đ";
}

function formatDateLabel(dateStr) {
    if (!dateStr) return "";
    const [, m, d] = dateStr.split("-");
    return `${d}/${m}`;
}

function toISO(date) {
    return date.toISOString().split("T")[0];
}

// COMPUTE STATS
function computeStats(orders) {
    const doneOrders = orders.filter((o) => o.status === "done");
    const pendingOrders = orders.filter((o) => o.status === "pending");

    const totalRevenue = doneOrders.reduce((sum, o) => sum + calcRevenue(o), 0);
    const totalOrders = orders.length;
    const completedOrders = doneOrders.length;
    const uniqueCustomers = new Set(
        orders.map((o) => o.customer?.id).filter(Boolean),
    ).size;

    // Doanh thu theo ngày (7 ngày gần nhất)
    const revenueByDate = {};
    doneOrders.forEach((o) => {
        const d = o.date ?? "unknown";
        revenueByDate[d] = (revenueByDate[d] ?? 0) + calcRevenue(o);
    });
    const sortedDates = Object.keys(revenueByDate).sort().slice(-7);
    const chartLabels = sortedDates.map(formatDateLabel);
    const chartValues = sortedDates.map((d) => revenueByDate[d]);

    // Doanh thu theo danh mục
    const revenueByCategory = {};
    doneOrders.forEach((o) => {
        const cat = o.product?.category?.name ?? "Khác";
        revenueByCategory[cat] = (revenueByCategory[cat] ?? 0) + calcRevenue(o);
    });

    // Top sản phẩm
    const productMap = {};
    doneOrders.forEach((o) => {
        const pid = o.product?.id;
        if (!pid) return;
        if (!productMap[pid]) {
            productMap[pid] = {
                name: o.product?.name ?? "?",
                remaining: o.product?.remaining ?? 0,
                qty: 0,
                revenue: 0,
            };
        }
        productMap[pid].qty += o.amount ?? 0;
        productMap[pid].revenue += calcRevenue(o);
    });
    const topProducts = Object.values(productMap)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    return {
        totalRevenue,
        totalOrders,
        completedOrders,
        pendingCount: pendingOrders.length,
        uniqueCustomers,
        chartLabels,
        chartValues,
        revenueByCategory,
        topProducts,
    };
}

// BUILD DOM (createElement)
function buildHeader(container) {
    const today = new Date();
    const monthAgo = new Date();
    monthAgo.setDate(today.getDate() - 30);

    const header = document.createElement("header");
    header.className = "header";

    const title = document.createElement("h2");
    title.textContent = "Báo cáo kinh doanh";

    const filterGroup = document.createElement("div");
    filterGroup.className = "filter-group";

    const dateFrom = document.createElement("input");
    dateFrom.type = "date";
    dateFrom.id = "dateFrom";
    dateFrom.value = toISO(monthAgo);

    const dateTo = document.createElement("input");
    dateTo.type = "date";
    dateTo.id = "dateTo";
    dateTo.value = toISO(today);

    const btnFilter = document.createElement("button");
    btnFilter.id = "btnFilter";

    const icon = document.createElement("i");
    icon.className = "fas fa-filter";

    btnFilter.appendChild(icon);
    btnFilter.append(" Lọc");

    filterGroup.append(dateFrom, dateTo, btnFilter);
    header.append(title, filterGroup);
    container.appendChild(header);
}

function buildStatsGrid(container) {
    const grid = document.createElement("div");
    grid.className = "stats";
    container.appendChild(grid);
}

function buildCharts(container) {
    const chartsContainer = document.createElement("div");
    chartsContainer.className = "charts-container";

    // Chart đường
    const lineBox = document.createElement("div");
    lineBox.className = "chart-box";

    const lineTitle = document.createElement("h3");
    lineTitle.textContent = "Biểu đồ doanh thu 7 ngày gần nhất";

    const lineCanvas = document.createElement("canvas");
    lineCanvas.id = "revenueChart";

    lineBox.append(lineTitle, lineCanvas);

    // Chart tròn
    const donutBox = document.createElement("div");
    donutBox.className = "chart-box";

    const donutTitle = document.createElement("h3");
    donutTitle.textContent = "Cơ cấu sản phẩm";

    const donutCanvas = document.createElement("canvas");
    donutCanvas.id = "categoryChart";

    donutBox.append(donutTitle, donutCanvas);

    chartsContainer.append(lineBox, donutBox);
    container.appendChild(chartsContainer);
}

function buildTopProducts(container) {
    const section = document.createElement("div");
    section.className = "table-container";

    const title = document.createElement("h3");
    title.textContent = "Sản phẩm bán chạy nhất";
    title.className = "table-header";

    const table = document.createElement("table");

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    ["Sản phẩm", "Số lượng bán", "Doanh thu", "Tình trạng"].forEach((text) => {
        const th = document.createElement("th");
        th.textContent = text;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    const tbody = document.createElement("tbody");
    tbody.id = "topProductBody";

    table.append(thead, tbody);
    section.append(title, table);
    container.appendChild(section);
}

// RENDER STAT CARDS
function renderStatCards(container, stats) {
    const profit = Math.round(stats.totalRevenue * 0.25);

    const items = [
        {
            title: "Doanh thu",
            value: formatVND(stats.totalRevenue),
            trendIcon: "fas fa-shopping-bag",
            trendText: `${stats.completedOrders} đơn hoàn thành`,
            trendClass: "trend up",
        },
        {
            title: "Đơn hàng",
            value: stats.totalOrders,
            trendIcon: "fas fa-clock",
            trendText: `${stats.pendingCount} đơn chờ xử lý`,
            trendClass: "trend",
            trendColor: "#f39c12",
        },
        {
            title: "Lợi nhuận",
            value: formatVND(profit),
            trendIcon: "fas fa-info-circle",
            trendText: "Ước tính 25% doanh thu",
            trendClass: "trend",
            trendColor: "#7f8c8d",
        },
        {
            title: "Khách hàng",
            value: stats.uniqueCustomers,
            trendIcon: "fas fa-users",
            trendText: "Khách hàng trong kỳ",
            trendClass: "trend up",
        },
    ];

    const grid = container.querySelector(".stats");
    grid.innerHTML = "";

    items.forEach((item) => {
        const card = document.createElement("div");
        card.className = "card";

        const h3 = document.createElement("h3");
        h3.textContent = item.title;

        const value = document.createElement("div");
        value.className = "value";
        value.textContent = item.value;

        const trend = document.createElement("div");
        trend.className = item.trendClass;
        if (item.trendColor) trend.style.color = item.trendColor;

        const trendIcon = document.createElement("i");
        trendIcon.className = item.trendIcon;

        const trendText = document.createTextNode(` ${item.trendText}`);

        trend.append(trendIcon, trendText);
        card.append(h3, value, trend);
        grid.appendChild(card);
    });
}

// RENDER CHARTS
let revenueChartInstance = null;
let categoryChartInstance = null;

function renderLineChart(container, labels, values) {
    const ctx = container.querySelector("#revenueChart")?.getContext("2d");
    if (!ctx) return;

    if (revenueChartInstance) revenueChartInstance.destroy();

    revenueChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Doanh thu (VNĐ)",
                    data: values,
                    borderColor: "#3498db",
                    backgroundColor: "rgba(52,152,219,0.1)",
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: { label: (c) => ` ${formatVND(c.raw)}` },
                },
            },
            scales: {
                y: { ticks: { callback: (v) => v.toLocaleString("vi-VN") } },
            },
        },
    });
}

function renderDoughnutChart(container, revenueByCategory) {
    const ctx = container.querySelector("#categoryChart")?.getContext("2d");
    if (!ctx) return;

    if (categoryChartInstance) categoryChartInstance.destroy();

    categoryChartInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: Object.keys(revenueByCategory),
            datasets: [
                {
                    data: Object.values(revenueByCategory),
                    backgroundColor: [
                        "#3498db",
                        "#2ecc71",
                        "#f1c40f",
                        "#e74c3c",
                        "#9b59b6",
                    ],
                    borderWidth: 2,
                    borderColor: "#fff",
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "bottom" },
                tooltip: {
                    callbacks: { label: (c) => ` ${formatVND(c.raw)}` },
                },
            },
        },
    });
}

// RENDER TOP PRODUCTS
function getStockStatus(remaining) {
    if (remaining === 0) return { text: "Hết hàng", color: "var(--danger)" };
    if (remaining < 10) return { text: "Sắp hết", color: "var(--danger)" };
    return { text: "Còn hàng", color: "var(--success)" };
}

function renderTopProducts(container, topProducts) {
    const tbody = container.querySelector("#topProductBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!topProducts.length) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 4;
        td.textContent = "Không có dữ liệu";
        td.className = "empty-row";
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    topProducts.forEach((p) => {
        const { text, color } = getStockStatus(p.remaining);

        const tr = document.createElement("tr");

        const tdName = document.createElement("td");
        tdName.textContent = p.name;

        const tdQty = document.createElement("td");
        tdQty.textContent = p.qty.toLocaleString("vi-VN");

        const tdRevenue = document.createElement("td");
        const strong = document.createElement("strong");
        strong.textContent = formatVND(p.revenue);
        tdRevenue.appendChild(strong);

        const tdStatus = document.createElement("td");
        const span = document.createElement("span");
        span.textContent = text;
        span.style.color = color;
        span.style.fontWeight = "500";
        tdStatus.appendChild(span);

        tr.append(tdName, tdQty, tdRevenue, tdStatus);
        tbody.appendChild(tr);
    });
}

// RENDER TẤT CẢ
function renderAll(container, orders) {
    const stats = computeStats(orders);
    renderStatCards(container, stats);
    renderLineChart(container, stats.chartLabels, stats.chartValues);
    renderDoughnutChart(container, stats.revenueByCategory);
    renderTopProducts(container, stats.topProducts);
}

// FILTER
function filterByDate(container, allOrders) {
    const from = container.querySelector("#dateFrom")?.value ?? "";
    const to = container.querySelector("#dateTo")?.value ?? "";

    return allOrders.filter((o) => {
        if (!o.date) return true;
        if (from && o.date < from) return false;
        if (to && o.date > to) return false;
        return true;
    });
}

// EXPORT — main.js gọi, mount vào #app
export async function report() {
    const container = document.createElement("div");
    container.className = "report-page";

    // Build DOM
    buildHeader(container);
    buildStatsGrid(container);
    buildCharts(container);
    buildTopProducts(container);

    // Fetch data
    let allOrders = [];
    try {
        allOrders = (await fetchData.get("orders")) || [];
    } catch (err) {
        console.error("Lỗi fetch orders:", err);
    }

    // Render data vào DOM
    renderAll(container, allOrders);

    // Gắn sự kiện nút Lọc
    container.querySelector("#btnFilter").addEventListener("click", () => {
        const filtered = filterByDate(container, allOrders);
        renderAll(container, filtered);
    });

    return container;
}

// Create and custom (Huy and Hieu)
// import { fetchData } from "../apis/api.js";
// import { renderChart } from "../components/chart.js";
// import { createSummary } from "../components/summary.js";
// import { commonTable } from "../components/table.js";
// import {
//     calcMetrics,
//     calcNewCus,
//     calcTrend,
//     formatDate,
//     formatDay,
//     formatVND,
//     getBestSellerAll,
//     getPrevPeriod,
// } from "../utils.js";

// export async function report() {
//     async function handleFilter(orders) {
//         const startDate = document.querySelector("#startDate").value;
//         const endDate = document.querySelector("#endDate").value;

//         const { prevStart, prevEnd } = getPrevPeriod(startDate, endDate);

//         const currentData = orders.filter(
//             (item) => item.date >= startDate && item.date <= endDate,
//         );
//         const prevData = orders.filter(
//             (item) => item.date >= prevStart && item.date <= prevEnd,
//         );

//         const currMetrics = calcMetrics(currentData);
//         const prevMetrics = calcMetrics(prevData);

//         const currNewCus = calcNewCus(currentData, startDate, orders);
//         const prevNewCus = calcNewCus(prevData, startDate, orders);

//         // Summary
//         const revTrend = calcTrend(currMetrics.revenue, prevMetrics.revenue);
//         const profitTrend = calcTrend(currMetrics.profit, prevMetrics.profit);
//         const orderTrend = calcTrend(currMetrics.count, prevMetrics.count);
//         const customerTrend = calcTrend(currNewCus, prevNewCus);

//         const summaryEl = createSummary([
//             {
//                 title: "Doanh thu",
//                 value: formatVND(currMetrics.revenue),
//                 cardColor: "no-border-left",
//                 trend: {
//                     trendValue: `${revTrend.value}%`,
//                     isTrendUp: revTrend.up,
//                 },
//             },
//             {
//                 title: "Đơn hàng",
//                 value: currMetrics.count,
//                 cardColor: "no-border-left",
//                 trend: {
//                     trendValue: `${orderTrend.value}%`,
//                     isTrendUp: orderTrend.up,
//                 },
//             },
//             {
//                 title: "Lợi nhuận",
//                 value: formatVND(currMetrics.profit),
//                 cardColor: "no-border-left",
//                 trend: {
//                     trendValue: `${profitTrend.value}%`,
//                     isTrendUp: profitTrend.up,
//                 },
//             },
//             {
//                 title: "Khách mới",
//                 value: currNewCus,
//                 cardColor: "no-border-left",
//                 trend: {
//                     trendValue: `${customerTrend.value}%`,
//                     isTrendUp: customerTrend.up,
//                 },
//             },
//         ]);
//         statsWrapper.appendChild(summaryEl);

//         // Table
//         const bestSekkerData = getBestSellerAll(currentData);
//         const columns = [
//             {
//                 title: "Sản phẩm",
//                 dataIndex: "info",
//                 render: (value) => `<strong>${value?.name}</strong>`,
//             },
//             {
//                 title: "Số lượng bán",
//                 dataIndex: "totalSold",
//             },
//             {
//                 title: "Doanh thu",
//                 dataIndex: "info",
//                 render: (value, row) => {
//                     const revenue = (value?.price || 0) * (row.totalSold || 0);
//                     return formatVND(revenue);
//                 },
//             },
//             {
//                 title: "Tình trạng",
//                 render: (_, row) => {
//                     const remaining = row.info.remaining || 0;
//                     if (remaining <= 0) {
//                         return `<span style="color: var(--danger)">Hết hàng</span>`;
//                     } else if (remaining < 10) {
//                         return `<span style="color: var(--danger)">Sắp hết (${remaining})</span>`;
//                     }
//                     return `<span style="color: var(--success)">Còn hàng</span>`;
//                 },
//             },
//         ];

//         commonTable(tableWrapper, columns, bestSekkerData);

//         const revenueByDate = currentData.reduce((acc, curr) => {
//             acc[curr.date] =
//                 (acc[curr.date] || 0) +
//                 (Number(curr.product?.price * curr.amount) || 0);
//             return acc;
//         }, {});

//         const labels = Object.keys(revenueByDate).sort();
//         const customLabels = labels.map((day) => formatDay(day));

//         const dataValues = labels.map((label) => revenueByDate[label]);

//         renderChart("revenueChart", "line", customLabels, dataValues, {
//             datasetLabel: "Doanh thu (VNĐ)",
//             backgroundColor: "rgba(52, 152, 219, 0.1)",
//             borderColor: "#3498db",
//             fill: true,
//             tension: 0.4,
//         });

//         const categoryMap = currentData.reduce((acc, curr) => {
//             const cat = curr.product?.category || "Khác";

//             if (curr.status === "done") {
//                 acc[cat.name] = (acc[cat.name] || 0) + 1;
//             }
//             return acc;
//         }, {});

//         renderChart(
//             "categoryChart",
//             "doughnut",
//             Object.keys(categoryMap),
//             Object.values(categoryMap),
//             {
//                 backgroundColor: ["#3498db", "#2ecc71", "#f1c40f"],
//                 showLegend: true,
//             },
//         );
//     }

//     const container = document.createElement("div");
//     container.innerHTML = `
//         <header class="header">
//             <h2>Báo cáo kinh doanh</h2>
//             <div class="filter-group">
//                 <span>Từ</span>
//                 <input type="date" id="startDate">
//                 <span>đến</span>
//                 <input type="date" id="endDate">
//                 <button id="btnFilter" style="padding: 8px 15px; background: var(--primary-color); color: white; border: none; border-radius: 5px; cursor: pointer;">Lọc</button>
//             </div>
//         </header>
//         <div class="stats-wrapper"></div>
//         <div class="charts-container">
//             <div class="chart-box">
//                 <h3>Biểu đồ doanh thu 7 ngày gần nhất</h3>
//                 <canvas id="revenueChart" width="369" height="184" style="display: block; box-sizing: border-box; height: 184.5px; width: 369px;"></canvas>
//             </div>
//             <div class="chart-box">
//                 <h3>Cơ cấu sản phẩm</h3>
//                 <canvas id="categoryChart" width="300" height="300" style="display: block; box-sizing: border-box; height: 300px; width: 300px;"></canvas>
//             </div>
//         </div>
//         <section class="table-container">
//             <div class="table-header">
//                 <h3>Sản phẩm bán chạy nhất</h3>
//             </div>
//             <div class="table-wrapper"></div>
//         </section>
//     `;

//     const tableWrapper = container.querySelector(".table-wrapper");
//     const statsWrapper = container.querySelector(".stats-wrapper");
//     const startDateEl = container.querySelector("#startDate");
//     const endDateEl = container.querySelector("#endDate");
//     const btnFilter = container.querySelector("#btnFilter");

//     // set input date default value
//     const today = new Date();
//     const sevenDaysAgo = new Date();
//     sevenDaysAgo.setDate(today.getDate() - 7);

//     const defaultEnd = formatDate(today);
//     const defaultStart = formatDate(sevenDaysAgo);

//     endDateEl.value = defaultEnd;
//     startDateEl.value = defaultStart;

//     async function loadAndRender() {
//         const orders = await fetchData.get("orders");

//         btnFilter.addEventListener("click", () => {
//             statsWrapper.innerHTML = "";
//             tableWrapper.innerHTML = "";

//             handleFilter(orders);
//         });

//         setTimeout(() => handleFilter(orders), 0);
//     }

//     await loadAndRender();

//     return container;
// }
