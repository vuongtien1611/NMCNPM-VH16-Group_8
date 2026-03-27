import { refreshAccessToken } from "./auth.js";

export function isTokenExpired(token) {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const now = Math.floor(Date.now() / 1000);
        return payload.exp - now < 30;
    } catch (e) {
        return true;
    }
}

export async function fetchWithAuth(endpoint, method = "GET", payload = null) {
    const API_URL =
        "https://k305jhbh09.execute-api.ap-southeast-1.amazonaws.com";

    let token = localStorage.getItem("access_token");

    const options = {
        method: method,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    };

    if (method !== "GET" && payload) {
        options.body = JSON.stringify(payload);
    }

    try {
        let response = await fetch(`${API_URL}/${endpoint}`, options);

        if (response.status === 401 || response.status === 400) {
            console.warn("Token expired, attempting to refresh...");
            const newToken = await refreshAccessToken();

            if (newToken) {
                options.headers["Authorization"] = `Bearer ${newToken}`;
                response = await fetch(`${API_URL}/${endpoint}`, options);
            } else {
                localStorage.clear();
                window.location.href = "login.html";
                return null;
            }
        }

        if (!response.ok) {
            const errorData = await response.json();
            console.error("API Error:", errorData);
            return null;
        }

        const result = await response.json();
        console.log("Dữ liệu nhận được:", result);
        return result;
    } catch (error) {
        console.error("Lỗi kết nối API:", error);
        return null;
    }
}
