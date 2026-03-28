const API_URL = "https://k305jhbh09.execute-api.ap-southeast-1.amazonaws.com";

export async function login(email, password) {
    const response = await fetch(`${API_URL}/auth/signin`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new Error("Sai email hoặc mật khẩu");
    }

    const { accessToken, refreshToken } = await response.json();

    // Lưu token vào localStorage
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);

    return accessToken;
}

// handel refresh token
let refreshP = null;

export function isTokenExpired(token) {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const now = Math.floor(Date.now() / 1000);
        return payload.exp - now < 30; // sắp hết hạn trong 30 giây
    } catch {
        return true;
    }
}

export async function refreshAccessToken() {
    // Nếu có rồi không gọi lại mà sử dụng luôn cái cũ
    if (refreshP) return refreshP;

    const refresh_token = localStorage.getItem("refresh_token");
    if (!refresh_token) return null;

    refreshP = (async () => {
        try {
            const response = await fetch(`${API_URL}/auth/refresh-token`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh_token }),
            });

            if (!response.ok) {
                localStorage.clear();
                window.location.href = "./login.html";
                return null;
            }

            const { accessToken, refreshToken } = await response.json();
            localStorage.setItem("access_token", accessToken);
            localStorage.setItem("refresh_token", refreshToken);
            return accessToken;
        } finally {
            refreshP = null;
        }
    })();

    return refreshP;
}

export async function checkAndRefreshToken() {
    const token = localStorage.getItem("access_token");
    if (token && !isTokenExpired(token)) return true;

    console.log("Token expired or missing. Refreshing...");
    const newToken = await refreshAccessToken();

    if (!newToken) {
        localStorage.clear();
        window.location.href = "login.html";
        return false;
    }
    return true;
}
