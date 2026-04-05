// export function renderChart(canvasId, type, labels, data, options = {}) {
//     const canvas = document.querySelector(`#${canvasId}`);
//     if (!canvas) return null;

//     // Nếu có canvans r thì xóa đi tạo mới
//     const existingChart = Chart.getChart(canvasId);
//     if (existingChart) {
//         existingChart.destroy();
//     }

//     return new Chart(canvas.getContext("2d"), {
//         type: type,
//         data: {
//             labels: labels,
//             datasets: [
//                 {
//                     label: options.datasetLabel || "",
//                     data: data,
//                     backgroundColor: options.backgroundColor || [
//                         "#3498db",
//                         "#2ecc71",
//                         "#f1c40f",
//                         "#e74c3c",
//                     ],
//                     borderColor: options.borderColor || "#3498db",
//                     fill: options.fill ?? true,
//                     tension: options.tension || 0.4,
//                 },
//             ],
//         },
//     });
// }
