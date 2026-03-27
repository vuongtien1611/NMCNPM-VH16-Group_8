import { commonTable } from "../components/table.js";
import { getCustomer } from "../js/customerApi.js";

export async function customer() {
    const customerData = await getCustomer();

    function getRankColor(rank) {
        switch (rank?.toUpperCase()) {
            case "GOLD":
                return "gold";
            case "SILVER":
                return "silver";
            case "BRONZE":
                return "#cd7f32";
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
            render: (value) => `
            <button class="btn-action" title="Lịch sử mua hàng"><i class="fas fa-history"></i></button>
            <button class="btn-action" title="Sửa"><i class="fas fa-user-edit"></i></button>
          `,
        },
    ];

    const container = document.createElement("div");
    container.innerHTML = `
            <header>
              <div class="search-bar">
                <input type="text" placeholder="Tìm tên, email hoặc số điện thoại...">
              </div>
              <button class="btn-add"><i class="fas fa-user-plus"></i> Thêm khách hàng</button>
            </header>
      
            <section class="stats">
              <div class="card">
                <h3>Tổng khách hàng</h3>
                <p>850</p>
              </div>
              <div class="card">
                <h3>Khách hàng mới (Tháng)</h3>
                <p>42</p>
              </div>
              <div class="card">
                <h3>Tỉ lệ quay lại</h3>
                <p>65%</p>
              </div>
            </section>
      
            <section class="table-container">
              <div class="table-header">
                <h3>Danh sách khách hàng</h3>
                <select style="padding: 8px; border-radius: 5px; border: 1px solid #ddd;">
                  <option value="ALL">Hạng: Tất cả</option>
                  <option value="GOLD">Hạng: Vàng</option>
                  <option value="SILVER">Hạng: Bạc</option>
                  <option value="BRONE">Hạng: Đồng</option>
                </select>
              </div>
              <div class="table-wrapper"></div>
            </section>
        `;

    const tableWrapper = container.querySelector(".table-wrapper");
    commonTable(tableWrapper, columns, customerData);
    return container;
}
