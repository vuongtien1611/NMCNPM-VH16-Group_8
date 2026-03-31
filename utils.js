import { fetchData } from "./apis/api.js";

export function getStatusColor(status) {
    switch (status?.toUpperCase()) {
        case "DELIVERING":
            return "delivering";
        case "DONE":
            return "done";
        case "PENDING":
            return "pending";
        case "CANCEL":
            return "cancel";
        default:
            return "#ccc";
    }
}

export function getStatus(status) {
    switch (status?.toUpperCase()) {
        case "DELIVERING":
            return "Đang giao hàng";
        case "DONE":
            return "Hoàn thành";
        case "PENDING":
            return "Chờ xử lý";
        case "CANCEL":
            return "Đã hủy";
        default:
            return "--";
    }
}

export function getRankColor(rank) {
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

export function getRankVN(rank) {
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

export function getcategoriVN(category) {
    switch (category?.toUpperCase()) {
        case "DESKTOP":
            return "Máy tính";
        case "SMARTPHONE":
            return "Điện thoại";
        case "TABLET":
            return "Máy tính bảng";
        case "ACCESSORY":
            return "Phụ kiện";
        default:
            return "-";
    }
}

export function formatAndMaskPhone(phone) {
    if (!phone || phone.length < 10) return phone;
    return phone.replace(/(\d{4})(\d{3})(\d{3})/, "$1.$2.xxx");
}

export function formatVND(price) {
    return Number(price).toLocaleString("vi-VN") + "đ";
}

export const validateDataPayload = {
    product: (categoryId, name, option = {}) => {
        const options = { ...option };
        return {
            // Required (bắt buộc)
            categoryId: Number(categoryId || 0),
            name: String(name || ""),

            // Optaional (không bắt buộc)
            id: Number(options.id),
            imageId: String(options.imageId || ""),
            sku: String(options.sku || ""),
            price: Math.floor(Number(options.price || 0)),
            remaining: Math.floor(Number(options.remaining || 0)),
        };
    },
    customer: (email, name, option = {}) => {
        const options = { ...option };
        return {
            // Required (bắt buộc)
            email: String(email || ""),
            name: String(name || ""),

            // Optaional (không bắt buộc)
            id: Number(options.id),
            address: String(options.address || ""),
            phone: String(options.phone || ""),
            rank: String(options.rank || ""),
        };
    },
    order: (productId, customerId, option = {}) => {
        const options = { ...option };
        return {
            // Required (bắt buộc)
            productId: Number(productId),
            customerId: Number(customerId),

            // Optaional (không bắt buộc)
            id: Number(options.id),
            amount: Number(options.amount || 0),
            status: String(options.status || "peding"),
        };
    },
};

export function createActionButtons({ id, endpoint, onSuccess }) {
    const container = document.createElement("div");
    container.className = "action-buttons";
    const editBtn = document.createElement("button");
    editBtn.className = "btn-icon edit";
    editBtn.innerHTML = `<i class="fas fa-edit"></i>`;
    editBtn.onclick = () => (window.location.hash = `/${endpoint}/edit/${id}`);
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-icon delete";
    deleteBtn.innerHTML = `<i class="fas fa-trash"></i>`;
    deleteBtn.onclick = async () => {
        if (!confirm("Bạn có chắc muốn xóa?")) return;
        deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        deleteBtn.style.pointerEvents = "none";
        if (endpoint === "orders") {
            const orders = await fetchData.get("orders");
            // Get order detail
            const orderDetail = orders.find((order) => order.id === id);
            if (orderDetail && orderDetail.product) {
                const productId = orderDetail.product.id;
                const orderAmount = Number(orderDetail.amount);
                // Get product detail
                const productDetail = await fetchData.get(
                    `products/${productId}`,
                );
                if (productDetail) {
                    const payload = validateDataPayload.product(
                        productDetail.category?.id,
                        productDetail.name,
                        {
                            ...productDetail,
                            id: productId,
                            remaining: productDetail.remaining + orderAmount,
                        },
                    );
                    await fetchData.update("products", payload);
                }
            }
        }
        const res = await fetchData.delete(endpoint, id);
        if (res && onSuccess) await onSuccess();
    };
    container.append(editBtn, deleteBtn);
    return container;
}
