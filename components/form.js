export function createForm({
    formId,
    fields = [],
    onSubmit,
    onCancel = null,
    initialValues = {}, // ✅ thêm
}) {
    const form = document.querySelector(formId);
    const state = {};

    fields.forEach((field) => {
        state[field.name] = initialValues[field.name] ?? "";
    });

    Object.keys(initialValues).forEach((key) => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) {
            input.value = initialValues[key];
        }
    });

    fields.forEach((field) => {
        const input = form.querySelector(`[name="${field.name}"]`);
        if (!input) return;

        input.addEventListener("input", (e) => {
            state[field.name] = e.target.value;

            const error = input.nextElementSibling;
            if (error && error.classList.contains("form-error")) {
                error.innerText = "";
            }
        });
    });

    function validate() {
        let isValid = true;

        fields.forEach((field) => {
            const input = form.querySelector(`[name="${field.name}"]`);
            if (!input) return;

            let error = input.nextElementSibling;
            if (!error || !error.classList.contains("form-error")) {
                error = document.createElement("div");
                error.className = "form-error";
                input.parentNode.appendChild(error);
            }

            const value = input.value;

            if (field.type === "number" && value !== "") {
                let valueN = input.value;
                if (isNaN(valueN.replace(/,/g, ""))) {
                    error.innerText = "Vui lòng nhập số hợp lệ";
                    isValid = false;
                    return;
                }
                valueN = valueN !== "" ? Number(valueN.replace(/,/g, "")) : 0;

                state[field.name] = valueN;
            }

            if (field.required && !value) {
                error.innerText = "Trường này là bắt buộc";
                isValid = false;
                return;
            }

            if (field.pattern && value) {
                const regex = new RegExp(field.pattern);
                if (!regex.test(value)) {
                    error.innerText = field.message || "Không hợp lệ";
                    isValid = false;
                    return;
                }
            }

            error.innerText = "";
        });

        return isValid;
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        fields.forEach((field) => {
            const input = form.querySelector(`[name="${field.name}"]`);
            if (input) state[field.name] = input.value;
        });

        if (!validate()) return;

        onSubmit && onSubmit({ ...state });
    });

    form.addEventListener("reset", (e) => {
        e.preventDefault();
        onCancel && onCancel();
        form.reset();
        fields.forEach((field) => {
            state[field.name] = initialValues[field.name] ?? "";
        });
    });

    return {
        getValues: () => ({ ...state }),
        setValues: (data) => {
            Object.keys(data).forEach((key) => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) {
                    input.value = data[key];
                    state[key] = data[key];
                }
            });
        },
    };
}
