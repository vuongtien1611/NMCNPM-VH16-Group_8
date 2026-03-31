import { fetchData } from "../apis/api.js";
import { createForm } from "../components/form.js";
import {
    formatAndMaskPhone,
    formatVND,
    validateDataPayload,
} from "../utils.js";

// Create product
export async function createProduct(params = {}) {
    const categories = await fetchData.get("categories");
    const container = document.createElement("div");
    const id = params?.id;
    let initialValues = {};
    if (id) {
        try {
            const res = await fetchData.get("products");
            const foundItem = res.find(
                (item) => String(item.id) === String(id),
            );
            if (foundItem) {
                initialValues = {
                    ...foundItem,
                    categoryId: foundItem.category?.id,
                };
            }
        } catch (err) {
            console.error(err);
        }
    }
    container.innerHTML = ` <div class="header-actions"> <a href="#/products" class="btn-back"> <i class="fas fa-arrow-left"></i> Quay lại danh sách </a> <h2>${id ? `Chỉnh sửa: ${initialValues.name}` : "Thêm sản phẩm"}</h2> </div> <form id="productForm"> <div class="form" > <div class="left-col"> <div class="card"> <h3>Thông tin chung</h3> <div class="form-group"> <label>Tên sản phẩm</label> <input type="text" placeholder="Nhập tên Product" name="name" /> </div> <div class="form-group"> <label>Mô tả sản phẩm</label> <textarea rows="5" placeholder="Nhập đặc điểm nổi bật..." name="description"></textarea> </div> </div> <div class="card"> <h3>Giá cả & Kho hàng</h3> <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;"> <div class="form-group"> <label>Giá bán (VNĐ)</label> <input type="number" name="price" /> </div> <div class="form-group"> <label>Giá vốn (VNĐ)</label> <input type="text" name="cost" /> </div> </div> <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;"> <div class="form-group"> <label>Mã SKU</label> <input type="text" name="sku"/> </div> <div class="form-group"> <label>Số lượng tồn kho</label> <input type="number" name="remaining" value=0 /> </div> </div> </div> </div> <div class="right-col"> <div class="card"> <h3>Hình ảnh sản phẩm</h3> <div class="image-upload"> <i class="fas fa-cloud-upload-alt"></i> <p>Nhấp để tải ảnh lên</p> <input type="file" id="fileInput" hidden /> <img id="imgPreview" class="preview-img" src="#" alt="Preview" /> </div> </div> <div class="card"> <h3>Phân loại</h3> <div class="form-group"> <label>Danh mục</label> <div style="display: flex; gap: 8px;"> <select name="categoryId" id="categorySelect" style="flex: 1;"> <option value="">Chọn danh mục</option> ${categories
        .filter((cat) =>
            ["Máy tính", "Điện thoại", "Máy tính bảng", "Phụ kiện"].includes(
                cat.name,
            ),
        )
        .map((cat) => `<option value="${cat.id}">${cat.name}</option>`)
        .join(
            "",
        )} </select> </div> <div id="quickAddCategoryBox" style="display: none; margin-top: 10px; background: #f8f9fa; padding: 10px; border-radius: 4px; border: 1px dashed #ddd;"> <div style="display: flex; gap: 5px;"> <input type="text" id="inputNewCategoryName" placeholder="Tên danh mục mới..." style="flex: 1; height: 32px; font-size: 13px;"> <button type="button" id="btnSubmitCategory" class="btn-save" style="padding: 0 10px; font-size: 12px; height: 32px;">Lưu</button> </div> </div> </div> <div class="form-group"> <label>Trạng thái</label> <select name="status"> <option>Đang bán</option> <option>Ngừng kinh doanh</option> <option>Hết hàng</option> </select> </div> </div> </div> </div> <div class="form-footer"> <button type="reset" class="btn btn-cancel">Hủy bỏ</button> <button type="submit" class="btn btn-save">Lưu sản phẩm</button> </div> </form> `;
    setTimeout(() => {
        createForm({
            formId: "#productForm",
            initialValues,
            fields: [
                { name: "name", required: true },
                { name: "price", required: true, type: "number" },
                { name: "imageId" },
                { name: "sku" },
                { name: "remaining", type: "number" },
                { name: "categoryId", required: true, type: "number" },
                { name: "description" },
                { name: "status" },
            ],
            onSubmit: async (values) => {
                const payload = validateDataPayload.product(
                    values.categoryId,
                    values.name,
                    {
                        price: values.price,
                        categoryId: values.categoryId,
                        sku: values.sku,
                        remaining: values.remaining,
                        imageId: values.imageId,
                    },
                );
                try {
                    let resposonsive;
                    if (id) {
                        resposonsive = await fetchData.update("products", {
                            ...payload,
                            id,
                        });
                        window.location.hash = "/products";
                    } else {
                        resposonsive = await fetchData.create(
                            "products",
                            payload,
                        );

                        window.location.hash = "/products/create";
                    }
                    if (!resposonsive) return;
                } catch (error) {
                    console.error(error);
                }
            },
            onCancel: () => (window.location.hash = "/products"),
        });
    });
    return container;
}
// Create order
export async function createOrder(params = {}) {
    const container = document.createElement("div");
    const id = params?.id;
    let initialValues = {};
    let products = [];
    let customers = [];
    const [prodRes, custRes, ordersRes] = await Promise.all([
        fetchData.get("products"),
        fetchData.get("customers"),
        fetchData.get("orders"),
    ]);
    products = prodRes || [];
    customers = custRes || [];
    if (id) {
        initialValues =
            ordersRes.find((item) => String(item.id) === String(id)) || {};
    }
    container.innerHTML = ` <div class="header-actions"> <a href="#/orders" class="btn-back"> <i class="fas fa-arrow-left"></i> Quay lại danh sách </a> <h2>${id ? `Chỉnh sửa đơn hàng: #${id}` : "Tạo đơn hàng mới"}</h2> </div> <form id="orderForm"> <div class="form"> <div class="card"> <div class="form-group"> <label>Chọn sản phẩm</label> <select name="productId" class="select-product"> ${id ? `${products.map((p) => ` <option value="${p.id}" ${initialValues.productId === p.id ? "selected" : ""}> ${p.name} - ${formatVND(p.price)} </option> `).join("")}` : `<option value="">-- Chọn sản phẩm --</option> ${products.map((p) => ` <option value="${p.id}" ${initialValues.productId === p.id ? "selected" : ""}> ${p.name} - ${formatVND(p.price)} </option> `).join("")}`} </select> </div> <div class="form-group"> <label>Khách hàng</label> <select name="customerId"> ${id ? `${customers.map((c) => ` <option value="${c.id}" ${initialValues.customerId === c.id ? "selected" : ""}> ${c.name} (${formatAndMaskPhone(c.phone)}) </option> `).join("")}` : `<option value="">-- Chọn khách hàng --</option> ${customers.map((c) => ` <option value="${c.id}" ${initialValues.customerId === c.id ? "selected" : ""}> ${c.name} (${formatAndMaskPhone(c.phone)}) </option> `).join("")}`} </select> </div> <div class="form-group"> <label>Số lượng</label> <input type="number" name="amount" value="${initialValues.amount || ""}" placeholder="Nhập số lượng"> </div> <div class="form-group"> <label>Trạng thái đơn hàng</label> <select name="status"> <option value="pending" ${initialValues.status === "pending" ? "selected" : ""}>PENDING</option> <option value="delivering" ${initialValues.status === "delivering" ? "selected" : ""}>DELIVERING</option> <option value="done" ${initialValues.status === "done" ? "selected" : ""}>DONE</option> <option value="cancel" ${initialValues.status === "cancel" ? "selected" : ""}>CANCEL</option> </select> </div> </div> </div> <div class="form-footer"> <button type="reset" class="btn btn-cancel">Hủy bỏ</button> <button type="submit" class="btn btn-save">${id ? "Cập nhật" : "Tạo đơn hàng"}</button> </div> </form> `;
    const productSelect = container.querySelector('select[name="productId"]');
    const amountInput = container.querySelector('input[name="amount"]');
    productSelect.addEventListener("change", (e) => {
        const p = products.find(
            (item) => String(item.id) === String(e.target.value),
        );
        if (p) {
            amountInput.placeholder = `Tối đa ${p.remaining}`;
            amountInput.min = 1;
            amountInput.max = p.remaining;
        }
    });
    setTimeout(() => {
        createForm({
            formId: "#orderForm",
            initialValues,
            fields: [
                { name: "productId", required: true },
                { name: "customerId", required: true },
                { name: "amount" },
                { name: "status" },
            ],
            onSubmit: async (values) => {
                try {
                    const selectedProduct = products.find(
                        (p) => String(p.id) === String(values.productId),
                    );
                    const orderId = window.location.hash.split("/").pop();
                    let finalRemaining;
                    if (orderId && !isNaN(orderId)) {
                        const isOrder = ordersRes.find(
                            (o) => Number(o.id) === Number(orderId),
                        );
                        const oldOrderAmount = Number(isOrder.amount);
                        const newOrderAmount = Number(values.amount);
                        const currentInventory = Number(
                            selectedProduct.remaining,
                        );
                        finalRemaining =
                            currentInventory + oldOrderAmount - newOrderAmount;
                    } else {
                        finalRemaining =
                            Number(selectedProduct.remaining) -
                            Number(values.amount);
                    }
                    console.log(values);
                    if (!selectedProduct) {
                        alert("Sản phẩm không tồn tại!");
                        return;
                    }
                    if (finalRemaining < 0) {
                        alert(
                            `Kho không đủ! Hiện còn: ${selectedProduct.remaining}`,
                        );
                        return;
                    }
                    let response;
                    if (id) {
                        response = await fetchData.update("orders", {
                            ...values,
                            id,
                        });
                        window.location.hash = "/orders";
                    } else {
                        response = await fetchData.create("orders", values);
                        window.location.hash = "/orders/create";
                    }
                    if (response) {
                        const payload = validateDataPayload.product(
                            selectedProduct.category?.id,
                            selectedProduct.name,
                            {
                                ...selectedProduct,
                                id: selectedProduct.id,
                                remaining: Math.floor(Number(finalRemaining)),
                            },
                        );
                        await fetchData.update("products", payload);
                    }
                } catch (error) {
                    console.error("Lỗi khi lưu đơn hàng:", error);
                }
            },
            onCancel: () => (window.location.hash = "/orders"),
        });
    });
    return container;
}
// // Create customer
export async function createCustomer(params = {}) {
    const container = document.createElement("div");
    const id = params?.id;
    let initialValues = {};
    if (id) {
        try {
            const res = await fetchData.get("customers");
            initialValues =
                res.find((item) => String(item.id) === String(id)) || {};
        } catch (err) {
            console.error(err);
        }
    }
    container.innerHTML = ` <div class="header-actions"> <a href="#/customers" class="btn-back"> <i class="fas fa-arrow-left"></i> Quay lại danh sách </a> <h2>${id ? `Chỉnh sửa: ${initialValues.name}` : "Thêm khách hàng"}</h2> </div> <form id="customerForm"> <div class="form"> <div class="card"> <div class="form-group"> <label>Họ và tên</label> <input type="text" name="name" placeholder="Nhập họ tên"> </div> <div class="form-group"> <label>Email</label> <input type="email" name="email" placeholder="Nhập email"> </div> <div class="form-group"> <label>Số điện thoại</label> <input type="text" name="phone" placeholder="Nhập số điện thoại"> </div> <div class="form-group"> <label>Địa chỉ</label> <textarea name="address" rows="3" placeholder="Nhập địa chỉ"></textarea> </div> <div class="form-group"> <label>Hạng khách hàng</label> <select name="rank"> <option value="">Chọn hạng</option> <option value="GOLD">VÀNG</option> <option value="SILVER">BẠC</option> <option value="BRONZE">ĐỒNG</option> </select> </div> </div> </div> <div class="form-footer"> <button type="reset" class="btn btn-cancel">Hủy bỏ</button> <button type="submit" class="btn btn-save">Lưu khách hàng</button> </div> </form> `;
    setTimeout(() => {
        createForm({
            formId: "#customerForm",
            initialValues,
            fields: [
                { name: "name", required: true },
                {
                    name: "email",
                    required: true,
                    pattern: "^\\S+@\\S+\\.\\S+$",
                    message: "Email không hợp lệ",
                },
                { name: "phone" },
                { name: "address" },
                { name: "rank", required: true },
            ],
            onSubmit: async (values) => {
                try {
                    let resposonsive;
                    if (id) {
                        resposonsive = await fetchData.update("customers", {
                            ...values,
                            id,
                        });
                        window.location.hash = "/customers";
                    } else {
                        resposonsive = await fetchData.create(
                            "customers",
                            values,
                        );
                        window.location.hash = "/customers/create";
                    }
                    if (!resposonsive) return;
                } catch (error) {
                    console.error(error);
                }
            },
            onCancel: () => (window.location.hash = "/customers"),
        });
    });
    return container;
}
