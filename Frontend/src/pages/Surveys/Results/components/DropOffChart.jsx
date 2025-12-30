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
import styles from './Analytics.module.scss';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const DropOffChart = ({ data }) => {
    if (!data || data.length === 0) return <div className={styles.noData}>No drop-off data available</div>;

    const chartData = {
        labels: data.map(d => `Q${d.questionId}`), // Simplified labels
        datasets: [
            {
                label: 'Responses',
                data: data.map(d => d.answerCount),
                backgroundColor: 'rgba(20, 184, 166, 0.6)', // Teal
                borderColor: 'rgba(20, 184, 166, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Response Count per Question (Drop-off Analysis)',
            },
            tooltip: {
                callbacks: {
                    afterLabel: function (context) {
                        const index = context.dataIndex;
                        return data[index].questionText; // Show full question text in tooltip
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Number of Responses'
                }
            }
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <h3>Drop-off Analysis</h3>
            </div>
            <div className={styles.chartContainer}>
                <Bar options={options} data={chartData} />
            </div>
            <div className={styles.insight}>
                <strong>Insight: </strong>
                Identify questions with significant drops in response count. These may be too difficult, sensitive, or irrelevant.
            </div>
        </div>
    );
};

export default DropOffChart;
