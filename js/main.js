import { sidebar } from "../components/sidebar.js";
import { home } from "../pages/home.js";
import { product } from "../pages/product.js";
import { order } from "../pages/order.js";
import { customer } from "../pages/customer.js";
import { createCustomer } from "../pages/create-customer.js";
import { report } from "../pages/report.js";
import { checkAndRefreshToken } from "../apis/auth.js";

const routes = {
    "/": home,
    "/products": product,
    "/orders": order,
    "/customers": customer,
    "/reports": report,
    "/customers/create": createCustomer,
};
const app = document.querySelector("#app");

const render = async () => {
    // check refresh token
    if (!(await checkAndRefreshToken())) return null;

    // sử dụng khi sài live sever
    const path = window.location.hash.replace("#", "") || "/";

    // có server
    // const path = window.location.pathname

    const page = routes[path] || null;

    document.querySelector("#sidebar").innerHTML = sidebar();

    app.innerHTML = "";

    if (typeof page === "function") {
        const content = await page();

        if (content instanceof HTMLElement) {
            app.appendChild(content);
        } else {
            app.innerHTML = content;
        }
    }

    bindLinks();
};

const bindLinks = () => {
    document.querySelectorAll("a[data-link]").forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const href = link.getAttribute("href");
            window.history.pushState(null, null, href);
            render();
        });
    });
};

// sử dụng khi sài live sever
window.addEventListener("hashchange", render);

// có server
// window.addEventListener("popstate", render);
document.addEventListener("DOMContentLoaded", render);
