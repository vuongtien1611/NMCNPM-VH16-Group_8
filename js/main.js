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
let authCheckTimeout = null;

async function startAutoRefresh() {
    // Xóa timeout cũ nếu có để tránh trùng lặp
    if (authCheckTimeout) clearTimeout(authCheckTimeout);

    const token = localStorage.getItem("access_token");
  
    if (token) {
        try {
            // Đợi hàm check hoàn tất
            await checkAndRefreshToken();
        } catch (error) {
            console.error("Lỗi khi auto refresh:", error);
        }
    }
  
    // auto check lại sau 1 phút để khi hết gần hết hạn accessToken gọi cái mới về
    authCheckTimeout = setTimeout(startAutoRefresh, 60 * 1000);
}

startAutoRefresh();

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
    try {
        // check refresh token
        const isAuth = await checkAndRefreshToken();
        if (!isAuth) {
            return;
        }

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
    } catch (error) {
        console.error("Lỗi hệ thống:", error);
    }
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
