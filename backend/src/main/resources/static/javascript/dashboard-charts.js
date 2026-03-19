document.addEventListener("DOMContentLoaded", function () {

    const rawDataElement = document.getElementById('chart-data');
    let chartLabels = [];
    let chartValues = [];
    let revenueLabels = [];
    let revenueValues = [];
    let barLabels = [];
    let visitsData = [];
    let interestData = [];

    if (rawDataElement) {
        try {
            const chartData = JSON.parse(rawDataElement.textContent);
            chartLabels = chartData.labels;
            chartValues = chartData.values;
            revenueLabels = chartData.revenueLabels;
            revenueValues = chartData.revenueValues;
            barLabels = chartData.barLabels;
            visitsData = chartData.visitsData;
            interestData = chartData.interestData;

        } catch (error) {
            console.error("Error at the chart data parsing:", error);
        }
    }

    if (chartLabels && typeof chartLabels !== 'undefined' && chartLabels.length > 0) {
        const ctx = document.getElementById('salesByCategoryChart').getContext('2d');

        const brandPalette = [
            '#2f6ced',
            '#111827',
            '#a5b4fc',
            '#c5ccdc',
            '#818cf8'
        ];

        Chart.defaults.font.family = "'Inter', sans-serif";
        Chart.defaults.font.size = 13;
        Chart.defaults.color = '#6b7280';

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'Products Sold',
                    data: chartValues,
                    backgroundColor: brandPalette,
                    borderWidth: 2,
                    borderColor: '#ffffff',
                    hoverOffset: 8,
                    spacing: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: {
                                size: 14,
                                weight: '500'
                            },
                            color: '#1f2937'
                        }
                    },
                    tooltip: {
                        backgroundColor: '#111827',
                        padding: 12,
                        cornerRadius: 8,
                        titleFont: {
                            size: 14,
                            weight: '700',
                            family: "'Inter', sans-serif"
                        },
                        bodyFont: {
                            size: 13,
                            family: "'Inter', sans-serif"
                        },
                        displayColors: true,
                        boxWidth: 8,
                        boxHeight: 8,
                        boxPadding: 6
                    }
                }
            }
        });
    } else {
        const chartCanvas = document.getElementById('salesByCategoryChart');
        if (chartCanvas) {
            chartCanvas.parentElement.innerHTML =
                '<div class="d-flex align-items-center justify-content-center h-100">' +
                '  <p class="text-muted text-center small">You have no sales yet.</p>' +
                '</div>';
        }
    }

    const revenueCtx = document.getElementById('revenueChart');

    if (revenueLabels && typeof revenueLabels !== 'undefined' && revenueLabels.length > 0) {

        new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: revenueLabels,
                datasets: [{
                    label: 'Revenues (€)',
                    data: revenueValues,
                    borderColor: '#2f6ced',
                    backgroundColor: 'rgba(47, 108, 237, 0.2)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#2f6ced'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) { return value + ' €'; }
                        }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    } else {
        if (revenueCtx) {
            revenueCtx.parentElement.innerHTML =
                '<div class="d-flex align-items-center justify-content-center h-100">' +
                '  <p class="text-muted text-center small">You have no sales yet.</p>' +
                '</div>';
        }
    }
    const barCtx = document.getElementById('visitsInterestChart');

    if (barCtx && typeof barLabels !== 'undefined' && barLabels.length > 0) {
        new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: barLabels,
                datasets: [
                    {
                        label: 'Visits',
                        data: visitsData,
                        backgroundColor: '#cbd5e0',
                        borderRadius: 4
                    },
                    {
                        label: 'Interest (Favs/Buys)',
                        data: interestData,
                        backgroundColor: '#2f6ced',
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            boxWidth: 10
                        }
                    }
                }
            }
        });
    } else if (barCtx) {
        barCtx.parentElement.innerHTML =
            '<div class="d-flex align-items-center justify-content-center h-100">' +
            '  <p class="text-muted text-center small">No interaction data available yet.</p>' +
            '</div>';
    }
});