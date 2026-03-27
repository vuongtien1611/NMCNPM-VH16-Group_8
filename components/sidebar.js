const pageTitles = [
    {
        title: "Tổng quan",
        icon: `<i class="fas fa-home"></i>`,
        path: "/",
    },
    {
        title: "Sản phẩm",
        icon: `<i class="fas fa-box"></i>`,
        path: "#/products",
    },
    {
        title: "Đơn hàng",
        icon: `<i class="fas fa-shopping-bag"></i>`,
        path: "#/orders",
    },
    {
        title: "Khách hàng",
        icon: `<i class="fas fa-users"></i>`,
        path: "#/customers",
    },
    {
        title: "Báo cáo",
        icon: `<i class="fas fa-chart-line"></i>`,
        path: "#/reports",
    },
];

export function sidebar() {
    // Get path in live server
    const cuurentPath = window.location.hash || "/";

    // server
    // const cuurentPath = window.location.pathName;

    return `
            <h2 class="">ShopAdmin</h2>
            <ul>
                ${pageTitles
                    .map((item) => {
                        // Check path
                        const isActive = cuurentPath === item.path;

                        return `
                            <li class=${isActive ? "active" : ""}>
                                <a href="${item.path}" data-link >
                                    <span class="">${item.icon}</span>
                                    ${item.title}
                                </a>
                            </li>
                            `;
                    })
                    .join("")}
            </ul>
    `;
}
