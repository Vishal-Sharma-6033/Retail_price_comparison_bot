import { useEffect, useState } from "react";
import { priceApi, productApi, shopApi, subscriptionApi } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import SubscriptionModal from "../components/SubscriptionModal.jsx";

const loadRazorpayScript = async () => {
  if (window.Razorpay) {
    return true;
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Dashboard = () => {
  const { user, updateUser, refreshUser } = useAuth();
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [shopForm, setShopForm] = useState({ name: "", address: "", phone: "" });
  const [priceForm, setPriceForm] = useState({
    productId: "",
    shopId: "",
    price: "",
    currency: "INR",
    inStock: true
  });
  const [productForm, setProductForm] = useState({ name: "", brand: "", category: "" });
  const [message, setMessage] = useState("");
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [modalState, setModalState] = useState({
    open: false,
    resource: "",
    currentPlan: "free",
    availablePlans: []
  });

  const loadDashboardData = async () => {
    const [shopResponse, productResponse] = await Promise.all([
      shopApi.myShops(),
      productApi.myProducts()
    ]);
    setShops(shopResponse.data.shops || []);
    setProducts(productResponse.data.products || []);
  };

  const loadSubscription = async () => {
    if (user?.role !== "shopkeeper") {
      return;
    }

    const response = await subscriptionApi.me();
    setSubscription(response.data.subscription || null);
    setPlans(response.data.plans || []);
  };

  const maybeOpenSubscriptionModal = (errorData) => {
    if (user?.role !== "shopkeeper" || errorData?.code !== "SUBSCRIPTION_REQUIRED") {
      return false;
    }

    setModalState({
      open: true,
      resource: errorData.resource,
      currentPlan: errorData.currentPlan || "free",
      availablePlans: errorData.availablePlans || plans
    });
    return true;
  };

  useEffect(() => {
    const load = async () => {
      await loadDashboardData();
      await loadSubscription();
    };

    load().catch(() => {
      setMessage("Failed to load dashboard data.");
    });
  }, [user?.role]);

  const handleCreateShop = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      const response = await shopApi.create(shopForm);
      setShops((prev) => [...prev, response.data.shop]);
      setShopForm({ name: "", address: "", phone: "" });
      setMessage("Shop created successfully. Location will be auto-detected from address.");
    } catch (error) {
      const errorData = error.response?.data;
      if (!maybeOpenSubscriptionModal(errorData)) {
        setMessage(errorData?.message || "Failed to create shop.");
      }
    }
  };

  const handleDeleteShop = async (shopId) => {
    if (!confirm("Are you sure you want to delete this shop?")) return;
    try {
      setMessage("");
      await shopApi.delete(shopId);
      setShops((prev) => prev.filter((shop) => shop._id !== shopId));
      setMessage("Shop deleted successfully.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to delete shop.");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      setMessage("");
      await productApi.delete(productId);
      setProducts((prev) => prev.filter((product) => product._id !== productId));
      setMessage("Product deleted successfully.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to delete product.");
    }
  };

  const handleCreateProduct = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      const response = await productApi.create(productForm);
      setProducts((prev) => [...prev, response.data.product]);
      setProductForm({ name: "", brand: "", category: "" });
      setMessage("Product added.");
    } catch (error) {
      const errorData = error.response?.data;
      if (!maybeOpenSubscriptionModal(errorData)) {
        setMessage(errorData?.message || "Failed to add product.");
      }
    }
  };

  const handleUpgradePlan = async (planCode) => {
    try {
      setUpgradeLoading(true);
      const [scriptLoaded, orderResponse] = await Promise.all([
        loadRazorpayScript(),
        subscriptionApi.createOrder({ planCode })
      ]);

      if (!scriptLoaded || !window.Razorpay) {
        setMessage("Razorpay checkout failed to load. Please try again.");
        setUpgradeLoading(false);
        return;
      }

      const { keyId, order, plan } = orderResponse.data;
      const razorpay = new window.Razorpay({
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Retail Price Bot",
        description: `${plan.name} plan upgrade`,
        order_id: order.id,
        prefill: {
          name: user?.name,
          email: user?.email
        },
        notes: {
          planCode: plan.code
        },
        theme: {
          color: "#0b7285"
        },
        handler: async (paymentResponse) => {
          try {
            const verifyResponse = await subscriptionApi.verify({
              planCode,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature
            });

            setSubscription(verifyResponse.data.subscription);
            updateUser(verifyResponse.data.user);
            await refreshUser();
            await loadSubscription();
            setModalState((prev) => ({ ...prev, open: false }));
            setMessage(verifyResponse.data.message || "Subscription upgraded successfully.");
          } catch (error) {
            setMessage(error.response?.data?.message || "Payment verification failed.");
          } finally {
            setUpgradeLoading(false);
          }
        }
      });

      razorpay.on("payment.failed", (event) => {
        const reason = event?.error?.description || "Payment failed. Please try again.";
        setMessage(reason);
        setUpgradeLoading(false);
      });

      setUpgradeLoading(false);
      razorpay.open();
    } catch (error) {
      setUpgradeLoading(false);
      setMessage(error.response?.data?.message || "Could not start payment flow.");
    }
  };

  const handleUpdatePrice = async (event) => {
    event.preventDefault();
    setMessage("");
    await priceApi.upsert({
      ...priceForm,
      price: Number(priceForm.price)
    });
    setMessage("Price updated.");
  };

  const handleFixShopLocation = async (shopId, shopName) => {
    try {
      setMessage("");
      const response = await shopApi.updateLocation(shopId);
      setShops((prev) =>
        prev.map((shop) =>
          shop._id === shopId ? response.data.shop : shop
        )
      );
      setMessage(`Location updated for ${shopName} ✓`);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update location. Ensure Google Maps API is configured.");
    }
  };

  return (
    <section className="page">
      <div className="hero compact">
        <div>
          <h1>Shopkeeper Dashboard</h1>
          <p>Manage shops, products, and price listings in one place.</p>
        </div>
      </div>
      {message ? <p className="notice">{message}</p> : null}
      {user?.role === "shopkeeper" ? (
        <div className="card subscription-summary-card">
          <div className="card-title">Your Plan</div>
          <p>
            Current: <strong>{subscription?.plan || "free"}</strong>
          </p>
          <p className="muted">
            Limits: {subscription?.limits?.shops ?? 1} shops, {subscription?.limits?.products ?? 1} products
          </p>
          <button
            className="ghost-btn"
            type="button"
            onClick={() =>
              setModalState({
                open: true,
                resource: "shops/products",
                currentPlan: subscription?.plan || "free",
                availablePlans: plans
              })
            }
          >
            Upgrade Plan
          </button>
        </div>
      ) : null}
      <div className="grid">
        <div className="card">
          <div className="card-title">Create Shop</div>
          <form className="form" onSubmit={handleCreateShop}>
            <label>
              Shop name
              <input
                type="text"
                value={shopForm.name}
                onChange={(event) => setShopForm({ ...shopForm, name: event.target.value })}
                required
              />
            </label>
            <label>
              Address
              <input
                type="text"
                value={shopForm.address}
                onChange={(event) => setShopForm({ ...shopForm, address: event.target.value })}
              />
            </label>
            <label>
              Phone
              <input
                type="text"
                value={shopForm.phone}
                onChange={(event) => setShopForm({ ...shopForm, phone: event.target.value })}
              />
            </label>
            <button className="primary-btn" type="submit">
              Save shop
            </button>
          </form>
        </div>
        <div className="card">
          <div className="card-title">Add Product</div>
          <form className="form" onSubmit={handleCreateProduct}>
            <label>
              Name
              <input
                type="text"
                value={productForm.name}
                onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
                required
              />
            </label>
            <label>
              Brand
              <input
                type="text"
                value={productForm.brand}
                onChange={(event) => setProductForm({ ...productForm, brand: event.target.value })}
              />
            </label>
            <label>
              Category
              <input
                type="text"
                value={productForm.category}
                onChange={(event) => setProductForm({ ...productForm, category: event.target.value })}
              />
            </label>
            <button className="primary-btn" type="submit">
              Add product
            </button>
          </form>
        </div>
      </div>
      <div className="grid">
        <div className="card">
          <div className="card-title">Update Price</div>
          <form className="form" onSubmit={handleUpdatePrice}>
            <label>
              Shop
              <select
                value={priceForm.shopId}
                onChange={(event) => setPriceForm({ ...priceForm, shopId: event.target.value })}
                required
              >
                <option value="">Select shop</option>
                {shops.map((shop) => (
                  <option key={shop._id} value={shop._id}>
                    {shop.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Product
              <select
                value={priceForm.productId}
                onChange={(event) => setPriceForm({ ...priceForm, productId: event.target.value })}
                required
              >
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Price
              <input
                type="number"
                min="0"
                step="0.01"
                value={priceForm.price}
                onChange={(event) => setPriceForm({ ...priceForm, price: event.target.value })}
                required
              />
            </label>
            <label>
              Currency
              <input
                type="text"
                value={priceForm.currency}
                onChange={(event) => setPriceForm({ ...priceForm, currency: event.target.value })}
              />
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={priceForm.inStock}
                onChange={(event) => setPriceForm({ ...priceForm, inStock: event.target.checked })}
              />
              In stock
            </label>
            <button className="primary-btn" type="submit">
              Update price
            </button>
          </form>
        </div>
      </div>
      <div className="card">
        <div className="card-title">My Shops</div>
        {shops.length === 0 ? (
          <p>No shops yet. Create your first shop above.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Address</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {shops.map((shop) => {
                  const hasValidCoords = shop.location?.coordinates && 
                    (shop.location.coordinates[0] !== 0 || shop.location.coordinates[1] !== 0);
                  return (
                    <tr key={shop._id}>
                      <td>{shop.name}</td>
                      <td>{shop.address || "—"}</td>
                      <td>{shop.phone || "—"}</td>
                      <td>
                        {hasValidCoords ? (
                          <span style={{ color: "var(--teal)", fontWeight: "500" }}>✓ Set</span>
                        ) : (
                          <button
                            className="ghost-btn"
                            style={{ padding: "4px 8px", fontSize: "0.85rem" }}
                            onClick={() => handleFixShopLocation(shop._id, shop.name)}
                          >
                            📍 Fix
                          </button>
                        )}
                      </td>
                      <td>
                        <button
                          className="danger-btn"
                          onClick={() => handleDeleteShop(shop._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="card">
        <div className="card-title">My Products</div>
        {products.length === 0 ? (
          <p>No products yet. Add your first product above.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>{product.name}</td>
                    <td>{product.brand || "—"}</td>
                    <td>{product.category || "—"}</td>
                    <td>
                      <button
                        className="danger-btn"
                        onClick={() => handleDeleteProduct(product._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <SubscriptionModal
        open={modalState.open && user?.role === "shopkeeper"}
        resource={modalState.resource}
        currentPlan={modalState.currentPlan}
        plans={modalState.availablePlans.length ? modalState.availablePlans : plans}
        loading={upgradeLoading}
        onClose={() => setModalState((prev) => ({ ...prev, open: false }))}
        onUpgrade={handleUpgradePlan}
      />
    </section>
  );
};

export default Dashboard;
