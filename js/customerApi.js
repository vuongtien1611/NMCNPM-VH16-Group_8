import { fetchWithAuth } from "../js/api.js";

export async function getCustomer() {
    try {
        const result = await fetchWithAuth("customers", "GET")
        return result
    } catch (error) {
        console.error(error);
    }
}

export async function createCustomer(payload) {
    try {
        const result = await fetchWithAuth("customers", "POST", payload)
        return result
    } catch (error) {
        console.error(error);
    }
}

export async function editCustomer(payload) {
    try {
        const result = await fetchWithAuth(`customers/${payload.id}`, "PUT", payload)
        return result
    } catch (error) {
        console.error(error);
    }
}

export async function deleteCustomer(id) {
    try {
        const result = await fetchWithAuth(`customers/${id}`, "DELETE")
        return result
    } catch (error) {
        console.error(error);
    }
}