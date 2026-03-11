import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { userApi, priceApi } from "../api/client.js";

const Profile = () => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [priceData, setPriceData] = useState({});
  const [insights, setInsights] = useState({ recentActivity: [], stats: null });
  const [insightsLoading, setInsightsLoading] = useState(true);
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

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const response = await userApi.profileInsights();
        setInsights({
          recentActivity: response.data.recentActivity || [],
          stats: response.data.stats || null
        });
      } catch (error) {
        console.error("Failed to load profile insights:", error);
      } finally {
        setInsightsLoading(false);
      }
    };

    loadInsights();
  }, []);

  const formatSearchTime = (value) => {
    if (!value) {
      return "-";
    }

    return new Date(value).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short"
    });
  };

  const statTiles = [
    {
      label: "Total Searches",
      value: insights.stats?.totalSearches ?? 0
    },
    {
      label: "Live Users",
      value: insights.stats?.liveUsers ?? 0
    },
    {
      label: "Platform Users",
      value: insights.stats?.totalUsers ?? 0
    },
    {
      label: "Products Tracked",
      value: insights.stats?.totalProducts ?? 0
    },
    {
      label: "Shops Onboarded",
      value: insights.stats?.totalShops ?? 0
    },
    {
      label: "Watchlist Items",
      value: insights.stats?.watchlistCount ?? watchlist.length
    }
  ];

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

  const handleDeleteActivity = async (activityId) => {
    if (!activityId) {
      return;
    }

    try {
      await userApi.deleteRecentActivity(activityId);
      setInsights((prev) => ({
        ...prev,
        recentActivity: prev.recentActivity.filter((item) => item._id !== activityId)
      }));
    } catch (error) {
      console.error("Failed to delete activity:", error);
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
          <div className="card-title">User Stats</div>
          {insightsLoading ? (
            <p className="muted">Loading usage stats...</p>
          ) : (
            <>
              <div className="profile-stats-grid">
                {statTiles.map((tile) => (
                  <div key={tile.label} className="profile-stat-item">
                    <span className="profile-stat-label">{tile.label}</span>
                    <span className="profile-stat-value">{tile.value}</span>
                  </div>
                ))}
              </div>
              {insights.stats?.memberSince ? (
                <p className="muted profile-member-since">
                  Member since {new Date(insights.stats.memberSince).toLocaleDateString()}
                </p>
              ) : null}
            </>
          )}
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
                      className="watchlist-remove-btn"
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

        <div className="card">
          <div className="card-title">Recent Activity</div>
          {insightsLoading ? (
            <p className="muted">Loading recent searches...</p>
          ) : insights.recentActivity.length === 0 ? (
            <p className="muted">No searches yet. Start searching products to build your activity history.</p>
          ) : (
            <div className="activity-list">
              {insights.recentActivity.map((item, index) => (
                <div
                  key={item._id || `${item.query}-${item.searchedAt || index}`}
                  className="activity-item"
                >
                  <div className="activity-main">
                    <div className="activity-query">{item.query}</div>
                    <div className="activity-meta muted">
                      {item.address ? `Near ${item.address} • ` : ""}
                      {formatSearchTime(item.searchedAt)}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="ghost-btn activity-delete-btn"
                    onClick={() => handleDeleteActivity(item._id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Profile;
