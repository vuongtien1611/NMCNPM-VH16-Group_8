import { editProductPage } from "../components/editProductPage.js";

export async function product() {
  const app = document.createElement("div");
  let edit = false;

  const ediBtn = document.createElement("button");
  ediBtn.textContent = "edit";
  app.append(ediBtn);

  ediBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    app.innerHTML = "";
    app.appendChild(editProductPage(1));
  });
  return app;
}
