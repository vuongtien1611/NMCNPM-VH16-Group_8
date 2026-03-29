import { fetchData } from "../apis/api.js";
import { createFilter } from "../components/filter.js";
import { createSummary } from "../components/summary.js";
import { commonTable } from "../components/table.js";

export async function customer() {
    const customers = await fetchData.get("customers");
    function getRankColor(rank) {
        switch (rank?.toUpperCase()) {
            case "GOLD":
                return "gold";
            case "SILVER":
                return "silver";
            case "BRONZE":
                return "bronze";
            default:
                return "#ccc";
        }
    }

    function getRankVN(rank) {
        switch (rank?.toUpperCase()) {
            case "GOLD":
                return "VÀNG";
            case "SILVER":
                return "BẠC";
            case "BRONZE":
                return "ĐỒNG";
            default:
                return "-";
        }
    }

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
            render: (_, row) => `${row.email}<br><small>${row.phone}</small>`,
        },
        {
            title: "Hạng",
            dataIndex: "rank",
            render: (_, row) => `<span class="tier ${getRankColor(row.rank)}">${getRankVN(row.rank)}</span>`,
        },
        { title: "Địa chỉ", dataIndex: "address" },
        {
            title: "Tổng chi tiêu",
            dataIndex: "totalSpending",
            render: (value) => (value ? `<strong>${value.toLocaleString("vi-VN")}đ</strong>` : `<em>Chưa có</em>`),
        },
        {
            title: "Thao tác",
            dataIndex: "id",
            render: (value) => {
                const fragment = document.createDocumentFragment();

                const editBtn = document.createElement("button");
                editBtn.classList.add("btn-icon", "edit", "btn-action");
                editBtn.title = "Sửa";
                editBtn.innerHTML = `<i class="fas fa-edit"></i>`;
                editBtn.addEventListener("click", () => {
                    window.location.hash = `/customers/edit/${value}`;
                });

                // 👉 nút delete
                const deleteBtn = document.createElement("button");
                deleteBtn.className = "btn-icon delete btn-action";
                deleteBtn.title = "Xóa";
                deleteBtn.innerHTML = `<i class="fas fa-trash"></i>`;

                deleteBtn.addEventListener("click", () => {
                    const confirmDelete = confirm("Bạn có chắc muốn xóa?");
                    if (confirmDelete) {
                        console.log("Delete id:", value);
                    }
                });
                fragment.appendChild(editBtn);
                fragment.appendChild(deleteBtn);
                return fragment;
            },

        },
    ];

    const container = document.createElement("div");
    container.innerHTML = `
            <header>
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
                <select style="padding: 8px; border-radius: 5px; border: 1px solid #ddd;">
                  <option value="ALL">Hạng: Tất cả</option>
                  <option value="GOLD">Hạng: Vàng</option>
                  <option value="SILVER">Hạng: Bạc</option>
                  <option value="BRONZE">Hạng: Đồng</option>
                </select>
              </div>
              <div class="table-wrapper"></div>
            </section>
        `;

    const tableWrapper = container.querySelector(".table-wrapper");
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
    const summaryEl = createSummary(summaryList);
    const statsWrapper = container.querySelector(".stats-wrapper");
    statsWrapper.appendChild(summaryEl);

    const searchInput = container.querySelector(".search-bar input");
    const select = container.querySelector("select");

    createFilter({
        data: customers,

        searchFields: ["name", "email", "phone"],

        searchEl: searchInput,
        selectEl: select,

        getFilterValue: (item, value) => {
            if (value === "ALL") return true;
            return item.rank?.toUpperCase() === value;
        },

        render: (filteredData) => {
            tableWrapper.innerHTML = "";
            commonTable(tableWrapper, columns, filteredData);
        },
    });

    return container;
}
