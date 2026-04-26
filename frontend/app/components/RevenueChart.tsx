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

interface RevenueChartProps {
    labels: string[];
    values: number[];
}

export default function RevenueChart({ labels, values }: RevenueChartProps) {
    const hasRevenue = values && values.some(val => val > 0);

    if (!labels || labels.length === 0 || !hasRevenue) {
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
                label: 'Revenue',
                data: values,
                borderColor: '#2f6ced',
                backgroundColor: 'rgba(47, 108, 237, 0.15)',
                borderWidth: 2,
                fill: true, 
                tension: 0.4,
                pointBackgroundColor: '#2f6ced', 
                pointBorderColor: '#ffffff', 
                pointBorderWidth: 1.5,
                pointRadius: 4,
                pointHoverRadius: 6, 
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false, 
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += context.parsed.y + ' €';
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: '#f3f4f6', 
                },
                ticks: {
                    color: '#6b7280',
                    font: { family: "'Inter', sans-serif" }
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: '#f3f4f6', 
                },
                ticks: {
                    color: '#6b7280',
                    font: { family: "'Inter', sans-serif" },
                    stepSize: 10000, 
                    callback: function (value: any) {
                        return value + ' €';
                    },
                },
            },
        },
    };

    return <Line data={data} options={options} />;
}