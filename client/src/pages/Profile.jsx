import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { userApi, priceApi } from "../api/client.js";

const Profile = () => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [priceData, setPriceData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWatchlist = async () => {
      try {
        const response = await userApi.watchlist();
        const products = response.data.watchlist || [];
        setWatchlist(products);

        // Fetch current best price for each product
        const pricePromises = products.map(async (product) => {
          try {
            const priceResponse = await priceApi.list({ productId: product._id });
            const listings = priceResponse.data.listings || [];
            if (listings.length > 0) {
              const sorted = [...listings].sort((a, b) => a.price - b.price);
              return { productId: product._id, bestPrice: sorted[0] };
            }
            return { productId: product._id, bestPrice: null };
          } catch {
            return { productId: product._id, bestPrice: null };
          }
        });

        const priceResults = await Promise.all(pricePromises);
        const priceMap = {};
        priceResults.forEach((result) => {
          priceMap[result.productId] = result.bestPrice;
        });
        setPriceData(priceMap);
      } catch (error) {
        console.error("Failed to load watchlist:", error);
      } finally {
        setLoading(false);
      }
    };

    loadWatchlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await userApi.removeWatch(productId);
      setWatchlist((prev) => prev.filter((p) => p._id !== productId));
      setPriceData((prev) => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });
    } catch (error) {
      console.error("Failed to remove from watchlist:", error);
    }
  };

  return (
    <section className="page">
      <div className="hero compact">
        <div>
          <h1>My Profile</h1>
          <p>Manage your account and track price changes on your watchlist.</p>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <div className="card-title">Account Info</div>
          <div className="profile-info">
            <div className="info-row">
              <span className="info-label">Name:</span>
              <span>{user?.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span>{user?.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Role:</span>
              <span className="role-chip">{user?.role}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Watchlist ({watchlist.length})</div>
          {loading ? (
            <p className="muted">Loading watchlist...</p>
          ) : watchlist.length === 0 ? (
            <p className="muted">
              Your watchlist is empty. Add products from the home page to track price drops.
            </p>
          ) : (
            <div className="watchlist-items">
              {watchlist.map((product) => {
                const priceInfo = priceData[product._id];
                return (
                  <div key={product._id} className="watchlist-item">
                    <div className="watchlist-product">
                      <div className="product-name">{product.name}</div>
                      <div className="product-meta">
                        {product.brand && <span>{product.brand}</span>}
                        {product.category && <span className="muted"> • {product.category}</span>}
                      </div>
                    </div>
                    <div className="watchlist-price">
                      {priceInfo ? (
                        <>
                          <span className="price-amount">
                            {priceInfo.price} {priceInfo.currency}
                          </span>
                          <span className="price-shop muted">at {priceInfo.shop?.name}</span>
                        </>
                      ) : (
                        <span className="muted">No prices available</span>
                      )}
                    </div>
                    <button
                      className="ghost-btn"
                      type="button"
                      onClick={() => handleRemove(product._id)}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Profile;
