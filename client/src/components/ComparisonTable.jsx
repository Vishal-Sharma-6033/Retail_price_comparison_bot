const ComparisonTable = ({ results, onAddToWatchlist, watchlistIds = [], onGetDirections, userLocation }) => (
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
            <th>Distance</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {results.map((item) => {
            const isWatched = watchlistIds.includes(item.product._id);
            const coordinates = item.shop?.location?.coordinates;
            const hasValidCoordinates =
              Array.isArray(coordinates) &&
              coordinates.length === 2 &&
              Number.isFinite(coordinates[0]) &&
              Number.isFinite(coordinates[1]) &&
              !(coordinates[0] === 0 && coordinates[1] === 0);
            const canGetDirections = Boolean(userLocation && (hasValidCoordinates || item.shop?.address));
            return (
              <tr key={item.product._id}>
                <td>{item.product.name}</td>
                <td>
                  {item.bestPrice} {item.currency}
                </td>
                <td>{item.shop?.name || "-"}</td>
                <td>
                  {canGetDirections ? (
                    <button
                      className="ghost-btn distance-btn"
                      type="button"
                      onClick={() => onGetDirections && onGetDirections(item.shop, userLocation)}
                    >
                      📍 Show Route
                    </button>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
                <td>
                  <div className="table-actions">
                    {item.shop?.phone ? (
                      <a href={`tel:${item.shop.phone}`} className="ghost-btn" style={{ textDecoration: 'none' }}>
                        📞 Call
                      </a>
                    ) : (
                      <button className="ghost-btn" type="button" disabled>
                        No Phone
                      </button>
                    )}
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
