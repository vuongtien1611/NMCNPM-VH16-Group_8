import { sidebar } from "../components/sidebar.js";
import { home } from "../pages/home.js";
import { product } from "../pages/product.js";
import { order } from "../pages/order.js";
import { customer } from "../pages/customer.js";
import { report } from "../pages/report.js";

const routes = {
    "/": home,
    "/products": product,
    "/orders": order,
    "/customers": customer,
    "/reports": report,
};
const app = document.querySelector("#app");

const render = () => {
    if (!localStorage.getItem("access_token")) {
        window.location.href = "login.html";
        return;
    }

    // sử dụng khi sài live sever
    const hash = window.location.hash || "/#";
    const path = hash.replace("#", "") || "/";

    // có server
    // const path = window.location.pathname

    const page = routes[path] || "";

    document.querySelector("#sidebar").innerHTML = sidebar();

    app.innerHTML = typeof page === "function" ? page() : page;

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
