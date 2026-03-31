import { fetchData } from "../apis/api.js";
import { createFilter } from "../components/filter.js";
import { createSummary } from "../components/summary.js";
import { commonTable } from "../components/table.js";
import { createActionButtons, formatVND } from "../utils.js";

export async function product() {
    const container = document.createElement("div");
    container.innerHTML = `
        <header class="header">
            <div class="search-bar">
                <input type="text" placeholder="Tìm sản phẩm...">
            </div>
            <a href="#/products/create" class="btn-add"><i class="fas fa-plus"></i> Thêm sản phẩm</a>
        </header>
        <div class="stats-wrapper"></div>
        <section class="table-container">
            <div class="table-header">
                <h3>Danh sách sản phẩm</h3>
                <div>
                    <label>Danh mục:</label>
                    <select id="categoryFilter" style="padding: 8px; border-radius: 5px; border: 1px solid #ddd;">
                        <option value="ALL">Tất cả</option>
                        <option value="DESKTOP">Máy tính</option>
                        <option value="SMARTPHONE">Điện thoại</option>
                        <option value="TABLET">Máy tính bảng</option>
                        <option value="ACCESSORY">Phụ kiện</option>
                    </select>
                </div>
            </div>
            <div class="table-wrapper"></div>
        </section>
    `;

    const tableWrapper = container.querySelector(".table-wrapper");
    const statsWrapper = container.querySelector(".stats-wrapper");
    const searchInput = container.querySelector(".search-bar input");
    const select = container.querySelector("#categoryFilter");

    async function loadAndRender() {
        const products = await fetchData.get("products");

        const columns = [
            {
                title: "Hình",
                dataIndex: "imageUrl",
                render: (_, row) =>
                    `<img src="https://picsum.photos/200?random=${row.id}" alt="${row.name}" style="width:45px; height:45px; object-fit:cover; border-radius:6px;">`,
            },
            {
                title: "Thông tin sản phẩm",
                dataIndex: "name",
                render: (_, row) =>
                    `<div><strong>${row.name}</strong><br><small>SKU: ${row.sku}</small></div>`,
            },
            {
                title: "Danh mục",
                dataIndex: "category",
                render: (value) => value.name || "Chưa phân loại",
            },
            {
                title: "Giá bán",
                dataIndex: "price",
                render: (value) => formatVND(value),
            },
            {
                title: "Tồn kho",
                dataIndex: "remaining",
            },
            {
                title: "Thao tác",
                dataIndex: "id",
                render: (value) =>
                    createActionButtons({
                        id: value,
                        endpoint: "products",
                        onSuccess: loadAndRender,
                    }),
            },
        ];

        commonTable(tableWrapper, columns, products);

        statsWrapper.innerHTML = "";
        const summaryEl = createSummary([
            {
                title: "Tổng sản phẩm",
                value: products?.length || 0,
                cardColor: "no-border-left",
            },
            { title: "Danh mục", value: "4", cardColor: "no-border-left" },
        ]);
        statsWrapper.appendChild(summaryEl);

        createFilter({
            data: products,
            searchFields: ["name", "sku"],
            searchEl: searchInput,
            filterEl: select,
            getFilterValue: (item, val) =>
                val === "ALL"
                    ? true
                    : item.category?.name?.toUpperCase() ===
                      getcategoriVN(val).toUpperCase(),
            render: (filteredData) => {
                tableWrapper.innerHTML = "";
                commonTable(tableWrapper, columns, filteredData);
            },
        });
    }

    await loadAndRender();

    return container;
}
