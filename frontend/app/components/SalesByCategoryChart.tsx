import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register the Chart.js elements we are going to use
ChartJS.register(ArcElement, Tooltip, Legend);
ChartJS.defaults.font.family = "'Inter', sans-serif";
ChartJS.defaults.color = '#6b7280';

interface SalesByCategoryChartProps {
    chartLabels: string[];
    chartValues: number[];
}

const SalesByCategoryChart = ({ chartLabels, chartValues }: SalesByCategoryChartProps) => {
    // Handle empty state (no data)
    if (!chartLabels || chartLabels.length === 0) {
        return (
            <div className="d-flex align-items-center justify-content-center h-100">
                <p className="text-muted text-center small">You have no sales yet.</p>
            </div>
        );
    }

    const data = {
        labels: chartLabels,
        datasets: [
            {
                label: 'Products Sold',
                data: chartValues,
                backgroundColor: ['#2f6ced', '#111827', '#a5b4fc', '#c5ccdc', '#818cf8'],
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverOffset: 8,
                spacing: 3,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    font: { size: 14, weight: 500 },
                    color: '#1f2937',
                },
            },
            tooltip: {
                backgroundColor: '#111827',
                padding: 12,
                cornerRadius: 8,
                titleFont: { size: 14, weight: 700, family: "'Inter', sans-serif" },
                bodyFont: { size: 13, family: "'Inter', sans-serif" },
                displayColors: true,
                boxWidth: 8,
                boxHeight: 8,
                boxPadding: 6,
            },
        },
    };

    return <Doughnut data={data} options={options} />;
};

export default SalesByCategoryChart;