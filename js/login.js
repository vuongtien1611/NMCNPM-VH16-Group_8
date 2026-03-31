import { login } from "../apis/auth.js";

(function isLogined() {
    const token = localStorage.getItem("access_token");

    if (token) {
        window.location.href = "./";
    }
})();

const loginForm = document.querySelector("#loginForm");

loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    try {
        await login(email, password);
        window.location.href = "./";
    } catch (error) {
        console.error(error);
    }
});
