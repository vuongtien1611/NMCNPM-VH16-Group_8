export function createFilter({
    data = [],
    render,
    searchFields = [],
    filterEl,
    searchEl,
    dateEl,
    getFilterValue,
}) {
    let filteredData = [...data];
    function applyFilter() {
        const keyword = searchEl?.value?.toLowerCase() || "";
        let filterValue = "";
        if (filterEl) {
            if (filterEl.tagName === "SELECT") {
                filterValue = filterEl.value;
            } else {
                const activeTab = filterEl.querySelector(".active");
                filterValue =
                    activeTab?.dataset.value || activeTab?.innerText || "";
            }
        }
        const dateValue = dateEl?.value || "";
        filteredData = data.filter((item) => {
            const matchKeyword = searchFields.length
                ? searchFields.some((field) =>
                      String(item[field] || "")
                          .toLowerCase()
                          .includes(keyword),
                  )
                : true;
            const matchSelect = getFilterValue
                ? getFilterValue(item, filterValue)
                : true;
            const matchDate = !dateValue || item.date === dateValue;
            return matchKeyword && matchSelect && matchDate;
        });
        render(filteredData);
    }
    if (filterEl?.tagName === "SELECT") {
        filterEl.addEventListener("change", applyFilter);
    } else if (filterEl) {
        filterEl.addEventListener("click", (e) => {
            const btn = e.target.closest("button");
            if (btn) {
                filterEl
                    .querySelectorAll("button")
                    .forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");
                applyFilter();
            }
        });
    }
    if (searchEl) searchEl.addEventListener("input", applyFilter);
    if (dateEl) selectEl.addEventListener("change", applyFilter);
    render(filteredData);
    return {
        getData: () => filteredData,
        setData: (newData) => {
            data = newData;
            applyFilter();
        },
    };
}
