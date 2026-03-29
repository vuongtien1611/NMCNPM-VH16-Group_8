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

export function sidebar(currentPath) {
    const cleanCurrentPath = currentPath.startsWith("#")
        ? currentPath.replace("#", "")
        : currentPath;

    return `
            <h2 class="">ShopAdmin</h2>
            <ul>
                ${pageTitles
                    .map((item) => {
                        const cleanTargetPath = item.path.replace("#", "");

                        // Check path
                        let isActive = false;
                        if (cleanTargetPath === "/") {
                            isActive = cleanCurrentPath === "/";
                        } else {
                            isActive =
                                cleanCurrentPath.startsWith(cleanTargetPath);
                        }

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
