import { fetchData } from "../apis/api.js";
import { createForm } from "../components/form.js";

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
    container.innerHTML = `
        <div class="header-actions">
            <a href="#/products" class="btn-back">
                <i class="fas fa-arrow-left"></i> Quay lại danh sách
            </a>
            <h2>${id ? `Chỉnh sửa: ${initialValues.name}` : "Thêm sản phẩm"}</h2>
        </div>

        <form id="productForm">        
            <div class="product-grid">
                <div class="left-col">
                <div class="card">
                    <h3>Thông tin chung</h3>
                    <div class="form-group">
                    <label>Tên sản phẩm</label>
                    <input
                        type="text"
                        placeholder="Nhập tên Product"
                        name="name"
                    />
                    </div>
                    <div class="form-group">
                    <label>Mô tả sản phẩm</label>
                    <textarea rows="5" placeholder="Nhập đặc điểm nổi bật..." name="description"></textarea>
                    </div>
                </div>

                <div class="card">
                    <h3>Giá cả & Kho hàng</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="form-group">
                        <label>Giá bán (VNĐ)</label>
                        <input type="number" name="price" />
                    </div>
                    <div class="form-group">
                        <label>Giá vốn (VNĐ)</label>
                        <input type="text" name="cost" />
                    </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="form-group">
                        <label>Mã SKU</label>
                        <input type="text" name="sku"/>
                    </div>
                    <div class="form-group">
                        <label>Số lượng tồn kho</label>
                        <input type="number" name="remaining" value=0 />
                    </div>
                    </div>
                </div>
                </div>

                <div class="right-col">
                <div class="card">
                    <h3>Hình ảnh sản phẩm</h3>
                    <div class="image-upload">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p>Nhấp để tải ảnh lên</p>
                    <input type="file" id="fileInput" hidden />
                    <img id="imgPreview" class="preview-img" src="#" alt="Preview" />
                    </div>
                </div>

                <div class="card">
                    <h3>Phân loại</h3>
                    <div class="form-group">
                        <label>Danh mục</label>
                        <div style="display: flex; gap: 8px;">
                            <select name="categoryId" id="categorySelect" style="flex: 1;">
                                <option value="">Chọn danh mục</option>
                                ${categories
                                    .filter((cat) =>
                                        [
                                            "Desktop",
                                            "Smartphone",
                                            "Tablet",
                                            "Accessory",
                                        ].includes(cat.name),
                                    )
                                    .map(
                                        (cat) =>
                                            `<option value="${cat.id}">${cat.name}</option>`,
                                    )
                                    .join("")}
                            </select>
                        </div>
                        
                        <div id="quickAddCategoryBox" style="display: none; margin-top: 10px; background: #f8f9fa; padding: 10px; border-radius: 4px; border: 1px dashed #ddd;">
                            <div style="display: flex; gap: 5px;">
                                <input type="text" id="inputNewCategoryName" placeholder="Tên danh mục mới..." style="flex: 1; height: 32px; font-size: 13px;">
                                <button type="button" id="btnSubmitCategory" class="btn-save" style="padding: 0 10px; font-size: 12px; height: 32px;">Lưu</button>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Trạng thái</label>
                        <select name="status">
                            <option>Đang bán</option>
                            <option>Ngừng kinh doanh</option>
                            <option>Hết hàng</option>
                        </select>
                    </div>
                </div>
                </div>
            </div>

            <div class="form-footer">
                <button type="reset" class="btn btn-cancel">Hủy bỏ</button>
                <button type="submit" class="btn btn-save">Lưu khách hàng</button>
            </div>
        </form>
    `;

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
                const dataToSave = {
                    name: values.name,
                    price: Number(values.price),
                    categoryId: Number(values.categoryId),
                    sku: values.sku || "",
                    remaining: Number(values.remaining) || 0,
                    imageId: values.imageId || "",
                };

                try {
                    let resposonsive;
                    if (id) {
                        resposonsive = await fetchData.update("products", {
                            ...dataToSave,
                            id,
                        });
                    } else {
                        resposonsive = await fetchData.create(
                            "products",
                            dataToSave,
                        );
                    }
                    if (!resposonsive) return;
                    window.location.hash = "/products";
                } catch (error) {
                    console.error(error);
                }
            },
            onCancel: () => (window.location.hash = "/products"),
        });
    });

    return container;
}
