import { useState } from "react";

const hasValidCoordinates = (shop) => {
  const coordinates = shop?.location?.coordinates;
  return (
    Array.isArray(coordinates) &&
    coordinates.length === 2 &&
    Number.isFinite(coordinates[0]) &&
    Number.isFinite(coordinates[1]) &&
    !(coordinates[0] === 0 && coordinates[1] === 0)
  );
};

const ComparisonTable = ({ results, onAddToWatchlist, watchlistIds = [], onGetDirections, userLocation }) => {
  const [expandedProducts, setExpandedProducts] = useState({});

  const toggleProduct = (productId) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  return (
    <div className="card">
      <div className="card-title">Price Comparison</div>
      {results.length === 0 ? (
        <p className="muted">Search for a product to compare nearby prices.</p>
      ) : (
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Shop</th>
              <th>Distance</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {results.flatMap((item) => {
              const productId = item.product._id;
              const isWatched = watchlistIds.includes(productId);
              const shops = item.shops?.length
                ? item.shops.slice(0, 3)
                : [{ shop: item.shop, price: item.bestPrice, currency: item.currency, distanceKm: null }];
              const isExpanded = Boolean(expandedProducts[productId]);
              const visibleShops = isExpanded ? shops : shops.slice(0, 1);
              const hasMoreShops = shops.length > 1;

              const rows = visibleShops.map((entry, index) => {
                const shop = entry.shop;
                const canGetDirections = Boolean(userLocation && (hasValidCoordinates(shop) || shop?.address));
                const rowKey = `${productId}-${shop?._id || index}`;

                return (
                  <tr key={rowKey}>
                    <td>{item.product.name}</td>
                    <td>
                      {entry.price} {entry.currency}
                    </td>
                    <td>{shop?.name || "-"}</td>
                    <td>
                      {entry.distanceKm !== null ? `${entry.distanceKm} km` : "-"}
                    </td>
                    <td>
                      <div className="table-actions">
                        {canGetDirections ? (
                          <button
                            className="ghost-btn distance-btn"
                            type="button"
                            onClick={() => onGetDirections && onGetDirections(shop, userLocation)}
                          >
                            📍 Show Route
                          </button>
                        ) : (
                          <span className="muted">No Route</span>
                        )}
                        {shop?.phone ? (
                          <a href={`tel:${shop.phone}`} className="ghost-btn" style={{ textDecoration: "none" }}>
                            📞 Call
                          </a>
                        ) : (
                          <button className="ghost-btn" type="button" disabled>
                            No Phone
                          </button>
                        )}
                        {index === 0 && onAddToWatchlist ? (
                          <button
                            className={isWatched ? "ghost-btn watched" : "ghost-btn"}
                            type="button"
                            onClick={() => onAddToWatchlist(productId)}
                            disabled={isWatched}
                          >
                            {isWatched ? "Watched" : "Watch"}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              });

              if (hasMoreShops) {
                rows.splice(
                  1,
                  0,
                  <tr key={`${productId}-toggle`} className="comparison-toggle-row">
                    <td colSpan="5">
                      <button
                        className="comparison-show-more-btn"
                        type="button"
                        onClick={() => toggleProduct(productId)}
                      >
                        {isExpanded ? "Show Less" : "Show More"}
                      </button>
                    </td>
                  </tr>
                );
              }

              return rows;
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ComparisonTable;
