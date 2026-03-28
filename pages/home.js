import { createSummary } from "../components/summary.js";

export async function home() {
    // ae nhớ là tạo element nha để có thể get DOM dễ dàng hơn là ae truyền vào 1 string
    // còn nếu ae truyền vào string k thì sẽ khó get DOM hơn phải dùng tới windown
    const container = document.createElement("div");

    const summary = createSummary();
    container.appendChild(summary);

    return container;
}
