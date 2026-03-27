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

export async function refreshAccessToken() {
    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) return null;

    const response = await fetch(`${API_URL}/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
        // Refresh token cũng hết hạn — yêu cầu đăng nhập lại
        localStorage.clear();
        window.location.href = "./login.html";
        return;
    }

    const { access_token, refresh_token } = await response.json();
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);

    return access_token;
}
