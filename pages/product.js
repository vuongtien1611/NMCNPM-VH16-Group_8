import { commonTable } from "../components/table.js";

export async function product() {
    const productDataMock = [
        {
            id: 1,
            category: "Điện thoại",
            imageUrl: "https://via.placeholder.com/80x80?text=iPhone+15",
            name: "iPhone 15 Pro Max",
            sku: "IP15PM-BLUE-256",
            price: 32500000,
            remaining: 45,
        },
        {
            id: 2,
            category: "Điện thoại",
            imageUrl: "https://via.placeholder.com/80x80?text=Samsung+S23",
            name: "Samsung Galaxy S23 Ultra",
            sku: "S23U-BLACK-512",
            price: 30990000,
            remaining: 30,
        },
        {
            id: 3,
            category: "Máy tính bảng",
            imageUrl: "https://via.placeholder.com/80x80?text=iPad+Pro",
            name: 'iPad Pro 12.9" 2023',
            sku: "IPADPRO-12-256",
            price: 27990000,
            remaining: 20,
        },
        {
            id: 4,
            category: "Phụ kiện",
            imageUrl: "https://via.placeholder.com/80x80?text=AirPods+Pro",
            name: "AirPods Pro 2",
            sku: "AIRP2-WHITE",
            price: 6490000,
            remaining: 100,
        },
        {
            id: 5,
            category: "Phụ kiện",
            imageUrl: "https://via.placeholder.com/80x80?text=Apple+Watch",
            name: "Apple Watch Series 9",
            sku: "AWATCH9-44MM",
            price: 12990000,
            remaining: 50,
        },
    ];

    const columns = [
        {
            title: "Hình",
            dataIndex: "imageUrl",
            render: (url) => `<img src="${url}" alt="Ảnh sản phẩm" style="width:60px; height:60px; object-fit:cover; border-radius:6px;">`,
        },
        {
            title: "Thông tin sản phẩm",
            dataIndex: "name",
            render: (_, row) => `
            <div>
              <strong>${row.name}</strong><br>
              <small>SKU: ${row.sku}</small>
            </div>
          `,
        },
        {
            title: "Danh mục",
            dataIndex: "category",
            render: (value) => value || "Chưa phân loại",
        },
        {
            title: "Giá bán",
            dataIndex: "price",
            render: (value) => `<strong>${value.toLocaleString("vi-VN")}đ</strong>`,
        },
        {
            title: "Tồn kho",
            dataIndex: "remaining",
        },
        {
            title: "Thao tác",
            dataIndex: "id",
            render: (id) => `
            <button class="btn-action" title="Sửa"><i class="fas fa-edit"></i></button>
            <button class="btn-action" title="Xóa"><i class="fas fa-trash"></i></button>
          `,
        },
    ];
    const container = document.createElement("div");
    container.innerHTML = `
              <div class="table-wrapper"></div>
    `
    const tableWrapper = container.querySelector(".table-wrapper");
    commonTable(tableWrapper, columns, productDataMock);
    return container;
}
