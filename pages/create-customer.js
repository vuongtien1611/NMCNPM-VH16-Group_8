export function createCustomer() {
    const container = document.createElement("div");
    container.innerHTML = `
        <div class="header-actions">
            <a href="/customers" class="btn-back"><i class="fas fa-arrow-left"></i> Quay lại danh sách</a>
            <h2>Thêm khách hàng</h2>
        </div>
        <form id="customerForm">
            <div class="card">
                <div class="form-group">
                    <label>Họ và tên</label>
                    <input type="text" name="name" placeholder="Nhập họ tên">
                </div>

                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" placeholder="Nhập email">
                </div>

                <div class="form-group">
                    <label>Số điện thoại</label>
                    <input type="text" name="phone" placeholder="Nhập số điện thoại">
                </div>

                <div class="form-group">
                    <label>Địa chỉ</label>
                    <textarea name="address" rows="3" placeholder="Nhập địa chỉ"></textarea>
                </div>

                <div class="form-group">
                    <label>Hạng khách hàng</label>
                    <select name="rank">
                    <option value="">Chọn hạng</option>
                    <option value="GOLD">VÀNG</option>
                    <option value="SILVER">BẠC</option>
                    <option value="BRONZE">ĐỒNG</option>
                    </select>
                </div>
            </div>

            <div class="form-footer">
                <button type="reset" class="btn btn-cancel">Hủy bỏ</button>
                <button type="submit" class="btn btn-save">Lưu khách hàng</button>
            </div>
        </form>
    `;
    return container;
}
