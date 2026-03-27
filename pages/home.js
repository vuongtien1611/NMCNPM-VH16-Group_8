import { fetchWithAuth } from "../js/api.js";

// cách tạo hàm get gì đó vd:
const getCategory = async () => {
    const res = await fetchWithAuth(`categories`);

    return await res;
};

// cách tạo hàm create gì đó vd:
const createCategory = async (payload) => {
    const res = await fetchWithAuth(`categories`, {
        method: "POST",
        body: JSON.stringify(payload),
    });

    return res;
};

// cách update hàm gì đó vd:
const updateCategory = async (id, newPayload) => {
    const res = await fetchWithAuth(`categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(newPayload),
    });

    return res;
};

// cách delete hàm gì đó vd:
const deleteCategory = async (id) => {
    const res = await fetchWithAuth(`categories/${id}`, {
        method: "DELETE",
    });

    return res;
};

export async function home() {
    // ae nhớ là tạo element nha để có thể get DOM dễ dàng hơn là ae truyền vào 1 string
    // còn nếu ae truyền vào string k thì sẽ khó get DOM hơn phải dùng tới windown
    const container = document.createElement("div");
    container.innerHTML = `
        <div class="form-group">
            <label>Mã SKU</label>
            <input type="text" id="input">
            <button id="btn-save">Lưu</button>
        </div>
    `;

    // get DOM và xử lý luôn
    const input = container.querySelector("#input");
    const btn = container.querySelector("#btn-save");

    btn.addEventListener("click", async (e) => {
        e.preventDefault();
        const value = input.value.trim();
        const dataToSend = {
            name: value,
        };

        // truyền payload vào
        // const createCategory1 = await createCategory(dataToSend);
        // console.log(createCategory1);

        // truyền id và payload
        // const updateCategory1 = await updateCategory(4, dataToSend);
        // console.log(updateCategory1);
    });

    // const caterogy = await getCategory();
    // console.log(caterogy);

    // truyền id
    // const deleteCategory1 = await deleteCategory(4);
    //     console.log(deleteCategory1);

    return container;
}
