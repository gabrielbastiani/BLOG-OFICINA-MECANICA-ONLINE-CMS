import { Bar } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';

interface ViewsProps {
    postViewsMetrics: any;

}

export function ViewsPostsData({ postViewsMetrics }: ViewsProps) {

    const chartOptions: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
        },
        scales: {
            x: {
                ticks: {
                    font: { size: 10 },
                },
            },
            y: {
                ticks: {
                    font: { size: 10 },
                },
            },
        },
    };

    const dailyViewsChartData = postViewsMetrics
        ? {
            labels: postViewsMetrics.dailyViews.map((post: { title: any; }) => post.title),
            datasets: [
                {
                    label: 'Visualizações Diárias',
                    data: postViewsMetrics.dailyViews.map((post: { views: any; }) => post.views),
                    backgroundColor: '#FF6384',
                },
            ],
        }
        : null;

    const weeklyViewsChartData = postViewsMetrics
        ? {
            labels: postViewsMetrics.weeklyViews.map((post: { title: any; }) => post.title),
            datasets: [
                {
                    label: 'Visualizações Semanais',
                    data: postViewsMetrics.weeklyViews.map((post: { views: any; }) => post.views),
                    backgroundColor: '#36A2EB',
                },
            ],
        }
        : null;

    const monthlyViewsChartData = postViewsMetrics
        ? {
            labels: postViewsMetrics.monthlyViews.map((post: { title: any; }) => post.title),
            datasets: [
                {
                    label: 'Visualizações Mensais',
                    data: postViewsMetrics.monthlyViews.map((post: { views: any; }) => post.views),
                    backgroundColor: '#FFCE56',
                },
            ],
        }
        : null;

    return (
        <div className="bg-white shadow-md rounded-lg p-4">

            <h2 className="text-lg font-semibold text-black mb-4">Visualizações de Posts</h2>

            <div className="space-y-4">
                <div className="rounded-md border p-3" style={{ height: '250px' }}>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Visualizações Diárias</h4>
                    {dailyViewsChartData && <Bar data={dailyViewsChartData} options={chartOptions} />}
                </div>

                <div className="rounded-md border p-3" style={{ height: '250px' }}>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Visualizações Semanais</h4>
                    {weeklyViewsChartData && <Bar data={weeklyViewsChartData} options={chartOptions} />}
                </div>

                <div className="rounded-md border p-3" style={{ height: '250px' }}>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Visualizações Mensais</h4>
                    {monthlyViewsChartData && <Bar data={monthlyViewsChartData} options={chartOptions} />}
                </div>
            </div>
        </div>
    )
};