const ComparisonTable = ({ results, onSelect, onAddToWatchlist, watchlistIds = [] }) => (
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
          {results.map((item) => {
            const isWatched = watchlistIds.includes(item.product._id);
            return (
              <tr key={item.product._id}>
                <td>{item.product.name}</td>
                <td>
                  {item.bestPrice} {item.currency}
                </td>
                <td>{item.shop?.name || "-"}</td>
                <td>
                  <div className="table-actions">
                    <button className="ghost-btn" type="button" onClick={() => onSelect(item.product)}>
                      View Trend
                    </button>
                    {onAddToWatchlist && (
                      <button
                        className={isWatched ? "ghost-btn watched" : "ghost-btn"}
                        type="button"
                        onClick={() => onAddToWatchlist(item.product._id)}
                        disabled={isWatched}
                      >
                        {isWatched ? "Watched" : "Watch"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    )}
  </div>
);

export default ComparisonTable;
