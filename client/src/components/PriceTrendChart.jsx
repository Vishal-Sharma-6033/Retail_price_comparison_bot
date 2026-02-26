import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const PriceTrendChart = ({ history, product }) => {
  if (!product) {
    return (
      <div className="card">
        <div className="card-title">Price Trend</div>
        <p className="muted">Select a product to view price history.</p>
      </div>
    );
  }

  const data = {
    labels: history.map((entry) => new Date(entry.recordedAt).toLocaleDateString()),
    datasets: [
      {
        label: product.name,
        data: history.map((entry) => entry.price),
        borderColor: "#0b7285",
        backgroundColor: "rgba(11, 114, 133, 0.2)",
        tension: 0.3
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
  };

  return (
    <div className="card chart-card">
      <div className="card-title">Price Trend</div>
      <div className="chart-wrapper">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default PriceTrendChart;
