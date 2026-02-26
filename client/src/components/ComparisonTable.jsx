const ComparisonTable = ({ results, onSelect }) => (
  <div className="card">
    <div className="card-title">Price Comparison</div>
    {results.length === 0 ? (
      <p className="muted">Search for a product to compare nearby prices.</p>
    ) : (
      <table className="comparison-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Best Price</th>
            <th>Shop</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {results.map((item) => (
            <tr key={item.product._id}>
              <td>{item.product.name}</td>
              <td>
                {item.bestPrice} {item.currency}
              </td>
              <td>{item.shop?.name || "-"}</td>
              <td>
                <button className="ghost-btn" type="button" onClick={() => onSelect(item.product)}>
                  View Trend
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

export default ComparisonTable;
