import { fetchData } from "../apis/api.js";

export async function createOrder() {
    const products = await fetchData.get("products");

    const customers = await fetchData.get("customers");

    const container = document.createElement("div");

    container.innerHTML = `<div class="header-actions">
            <a href="#/orders" class="btn-back">
                <i class="fas fa-arrow-left"></i> Quay lại order
            </a>
             <h1>create order</h1>
        </div>
         <form id="customerForm">
            <div class="form form-one-col" >
                <div class="card">
                    <div class="form-group">
                        <label>Khách hàng</label>
                        <select name="customerId">
                            <option value="">Chọn khách hàng</option>
                            ${customers
                                .map((customer) => {
                                    return `<option value="${customer.id}">${customer.name}</option>`;
                                })
                                .join("")}
                        </select>
                    </div>
    
                    <div class="form-group">
                        <label> Sản phẩm </label>
                         <select name="productId">
                            <option value="">Chọn sản phẩm</option>
                            ${products
                                .map((product) => {
                                    return `<option value="${product.id}">${product.name}</option>`;
                                })
                                .join("")}
                        </select>
                    </div>
    
                    <div class="form-group">
                        <label>Số lượng</label>
                         <input name="amount" type="number" />
                    </div>
                </div>
            </div>

            <div class="form-footer">
                <button type="reset" class="btn btn-cancel">Hủy bỏ</button>
                <button type="submit" class="btn btn-save">Lưu đơn hàng</button>
            </div>
        </form>
    `;

    const form = container.querySelector("#customerForm");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(form).entries());

        formData.customerId = Number(formData.customerId);
        formData.productId = Number(formData.productId);
        formData.amount = Number(formData.amount);

        if (Number.isNaN(formData.customerId) || formData.customerId <= 0) {
            alert("Khách hàng không hợp lệ");
            return;
        }

        if (Number.isNaN(formData.productId) || formData.productId <= 0) {
            alert("Sản phẩm không hợp lệ");
            return;
        }

        if (Number.isNaN(formData.amount) || formData.amount <= 0) {
            alert("Số lượng không hợp lệ");
            return;
        }

        const selectedCustomer = customers.find((c) => c.id === formData.customerId);
        const selectedProduct = products.find((p) => p.id === formData.productId);

        if (!selectedCustomer) {
            alert("Khách hàng không hợp lệ");
            return;
        }

        if (!selectedProduct) {
            alert("Sản phẩm không hợp lệ");
            return;
        }

        const remaining = selectedProduct.remaining;

        if (Number.isNaN(remaining) || remaining < 0) {
            alert("Số lượng tồn kho của sản phẩm không hợp lệ");
            return;
        }

        if (formData.amount > remaining) {
            alert(`Số lượng vượt quá tồn kho. Chỉ còn ${remaining} sản phẩm.`);
            return;
        }

        const isPostOrder = confirm(`
                Bạn có muốn tạo đơn hàng này không?
                Khách hàng: ${selectedCustomer.name}
                Sản phẩm: ${selectedProduct.name}
                Số lượng: ${formData.amount}
                Tồn kho còn lại sau khi tạo: ${remaining - formData.amount}
            `);

        if (!isPostOrder) return;

        const newOrder = await fetchData.create("orders", {
            ...formData,
            status: "pending",
        });

        const updatedProductPayload = {
            categoryId: selectedProduct.category.id,
            name: selectedProduct.name,
            sku: selectedProduct.sku,
            price: selectedProduct.price,
            remaining: remaining - formData.amount,
            imageId: "",
            id: formData.productId,
        };
        console.log(updatedProductPayload);

        const pro = await fetchData.update("products", { ...updatedProductPayload });

        console.log(pro);
        console.log(newOrder);

        if (newOrder?.status === "pending") {
            alert("Tạo đơn hàng thành công");
        } else {
            alert("Đã tạo đơn hàng");
        }

        selectedProduct.remaining = remaining - formData.amount;

        form.reset();
    });

    return container;
}
