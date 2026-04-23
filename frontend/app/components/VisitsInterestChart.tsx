import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register required Chart.js elements
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
ChartJS.defaults.font.family = "'Inter', sans-serif";
ChartJS.defaults.color = '#6b7280';

interface VisitsInterestChartProps {
    labels: string[];
    visits: number[];
    interest: number[];
}

export default function VisitsInterestChart({ labels, visits, interest }: VisitsInterestChartProps) {
    // Handle empty state
    if (!labels || labels.length === 0 || labels[0] === "No Data") {
        return (
            <div className="d-flex align-items-center justify-content-center h-100 py-5 opacity-50">
                <p className="fw-600 text-dark mb-0">No interaction data available yet</p>
            </div>
        );
    }

    const data = {
        labels,
        datasets: [
            {
                label: 'Visits',
                data: visits,
                backgroundColor: '#cbd5e0',
                borderRadius: 4,
            },
            {
                label: 'Interest (Favs/Buys)',
                data: interest,
                backgroundColor: '#2f6ced',
                borderRadius: 4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    usePointStyle: true,
                    boxWidth: 10,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { stepSize: 1 },
            },
        },
    };

    return <Bar data={data} options={options} />;
}