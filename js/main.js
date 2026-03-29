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

    "/customers/edit/:id": createCustomer,
};
const app = document.querySelector("#app");

const matchRoute = (path, routes) => {
    for (const route in routes) {
        const paramNames = [];

        // chuyển "/customers/edit/:id" → regex
        const regexPath = route.replace(/:([^/]+)/g, (_, paramName) => {
            paramNames.push(paramName);
            return "([^/]+)";
        });

        const regex = new RegExp(`^${regexPath}$`);
        const match = path.match(regex);

        if (match) {
            const params = {};

            paramNames.forEach((name, index) => {
                params[name] = match[index + 1];
            });

            return {
                page: routes[route],
                params,
            };
        }
    }

    return null;
}

const render = async () => {
    // check refresh token
    if (!(await checkAndRefreshToken())) return null;

    // sử dụng khi sài live sever
    const path = window.location.hash.replace("#", "") || "/";

    // có server
    // const path = window.location.pathname

    const match = matchRoute(path, routes);

    document.querySelector("#sidebar").innerHTML = sidebar();
    app.innerHTML = "";

    if (match) {
        const { page, params } = match;
        const content = await page(params); 
        if (content instanceof HTMLElement) {
            app.appendChild(content);
        } else {
            app.innerHTML = content;
        }
    } else {
        app.innerHTML = "<h2>404 - Not Found</h2>";
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
