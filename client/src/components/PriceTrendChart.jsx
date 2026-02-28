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

const PriceTrendChart = ({ history, product, analytics }) => {
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

  const trendIcon = {
    rising: "📈",
    declining: "📉",
    neutral: "➡️"
  };

  const getTrendColor = (trend) => {
    if (trend === "rising") return "#d9480f";
    if (trend === "declining") return "#087e8b";
    return "#666";
  };

  return (
    <div className="card chart-card">
      <div className="card-title">Price Trend</div>
      {analytics && (
        <div className="analytics-grid">
          <div className="analytics-item">
            <div className="analytics-label">Current Price</div>
            <div className="analytics-value">₹{analytics.currentPrice?.toFixed(2)}</div>
          </div>
          <div className="analytics-item">
            <div className="analytics-label">Min / Max</div>
            <div className="analytics-value">₹{analytics.minPrice?.toFixed(2)} / ₹{analytics.maxPrice?.toFixed(2)}</div>
          </div>
          <div className="analytics-item">
            <div className="analytics-label">Average</div>
            <div className="analytics-value">₹{analytics.averagePrice?.toFixed(2)}</div>
          </div>
          <div className="analytics-item">
            <div className="analytics-label">Change</div>
            <div className="analytics-value" style={{ color: analytics.percentageChange < 0 ? "#087e8b" : "#d9480f" }}>
              {analytics.percentageChange > 0 ? "+" : ""}{analytics.percentageChange?.toFixed(2)}%
            </div>
          </div>
          <div className="analytics-item">
            <div className="analytics-label">Trend</div>
            <div className="analytics-value" style={{ color: getTrendColor(analytics.trend) }}>
              {trendIcon[analytics.trend]} {analytics.trend}
            </div>
          </div>
          <div className="analytics-item">
            <div className="analytics-label">Data Points</div>
            <div className="analytics-value">{analytics.dataPoints}</div>
          </div>
        </div>
      )}
      <div className="chart-wrapper">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default PriceTrendChart;
