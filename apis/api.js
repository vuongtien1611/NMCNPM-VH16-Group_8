import { refreshAccessToken, checkAndRefreshToken } from "./auth.js";

async function fetchWithAuth(endpoint, method = "GET", payload = null) {
    const API_URL =
        "https://k305jhbh09.execute-api.ap-southeast-1.amazonaws.com";

    if (!(await checkAndRefreshToken())) return null;

    const token = localStorage.getItem("access_token");

    const headers = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const options = {
        method: method,
        headers: headers,
    };

    if (method !== "GET" && payload) {
        options.body = JSON.stringify(payload);
    }

    try {
        let response = await fetch(`${API_URL}/${endpoint}`, options);

        if (response.status === 401) {
            console.warn("Token expired, attempting to refresh...");
            const newToken = await refreshAccessToken();

            if (!newToken) {
                localStorage.clear();
                window.location.href = "login.html";
                return null;
            }

            options.headers["Authorization"] = `Bearer ${newToken}`;
            response = await fetch(`${API_URL}/${endpoint}`, options);
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("API Error:", errorData);
            return null;
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Lỗi kết nối API:", error);
        return null;
    }
}

export const fetchData = {
    get: async (endpoint) => {
        try {
            const result = await fetchWithAuth(endpoint);
            return result;
        } catch (error) {
            console.error(error);
        }
    },
    create: async (endpoint, payload) => {
        try {
            const result = await fetchWithAuth(endpoint, "POST", payload);
            return result;
        } catch (error) {
            console.error(error);
        }
    },
    update: async (endpoint, payload) => {
        try {
            const result = await fetchWithAuth(
                `${endpoint}/${payload.id}`,
                "PUT",
                payload,
            );
            return result;
        } catch (error) {
            console.error(error);
        }
    },
    delete: async (endpoint, id) => {
        try {
            const result = await fetchWithAuth(`${endpoint}/${id}`, "DELETE");
            return result;
        } catch (error) {
            console.error(error);
        }
    },
};
