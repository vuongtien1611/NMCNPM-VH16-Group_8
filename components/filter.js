export function createFilter({
    data = [],
    render,
    searchFields = [],
    selectEl,
    searchEl,
    getFilterValue,
}) {
    let filteredData = [...data];

    function applyFilter() {
        const keyword = searchEl?.value?.toLowerCase() || "";
        const filterValue = selectEl?.value;

        filteredData = data.filter((item) => {
            const matchKeyword = searchFields.length ? searchFields.some((field) => item[field]?.toLowerCase().includes(keyword)) : true;
            const matchSelect = getFilterValue ? getFilterValue(item, filterValue) : true;

            return matchKeyword && matchSelect;
        });

        render(filteredData);
    }

    if (selectEl) selectEl.addEventListener("change", applyFilter);
    if (searchEl) searchEl.addEventListener("input", applyFilter);

    render(filteredData);

    return {
        getData: () => filteredData,
        setData: (newData) => {
            data = newData;
            applyFilter();
        },
    };
}
