import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register required Chart.js elements
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
);
ChartJS.defaults.font.family = "'Inter', sans-serif";
ChartJS.defaults.color = '#6b7280';

interface RevenueChartProps {
    labels: string[];
    values: number[];
}

export default function RevenueChart({ labels, values }: RevenueChartProps) {
    // Handle empty state
    if (!labels || labels.length === 0 || !values || values.length === 0 || values[0] === 0) {
        return (
            <div className="d-flex align-items-center justify-content-center h-100 py-5 opacity-50">
                <p className="fw-600 text-dark mb-0">No revenue data available yet</p>
            </div>
        );
    }

    const data = {
        labels,
        datasets: [
            {
                label: 'Revenue €',
                data: values,
                borderColor: '#2f6ced',
                backgroundColor: 'rgba(47, 108, 237, 0.05)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false, // Hidden as requested in your original code
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return <Line data={data} options={options} />;
}