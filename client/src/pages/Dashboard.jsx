import { useEffect, useState } from "react";
import { priceApi, productApi, shopApi } from "../api/client.js";

const Dashboard = () => {
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

  useEffect(() => {
    const load = async () => {
      const [shopResponse, productResponse] = await Promise.all([
        shopApi.myShops(),
        productApi.list()
      ]);
      setShops(shopResponse.data.shops || []);
      setProducts(productResponse.data.products || []);
    };

    load();
  }, []);

  const handleCreateShop = async (event) => {
    event.preventDefault();
    setMessage("");
    const response = await shopApi.create(shopForm);
    setShops((prev) => [...prev, response.data.shop]);
    setShopForm({ name: "", address: "", phone: "" });
    setMessage("Shop created.");
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

  const handleCreateProduct = async (event) => {
    event.preventDefault();
    setMessage("");
    const response = await productApi.create(productForm);
    setProducts((prev) => [...prev, response.data.product]);
    setProductForm({ name: "", brand: "", category: "" });
    setMessage("Product added.");
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

  return (
    <section className="page">
      <div className="hero compact">
        <div>
          <h1>Shopkeeper Dashboard</h1>
          <p>Manage shops, products, and price listings in one place.</p>
        </div>
      </div>
      {message ? <p className="notice">{message}</p> : null}
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
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {shops.map((shop) => (
                  <tr key={shop._id}>
                    <td>{shop.name}</td>
                    <td>{shop.address || "—"}</td>
                    <td>{shop.phone || "—"}</td>
                    <td>
                      <button
                        className="danger-btn"
                        onClick={() => handleDeleteShop(shop._id)}
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
    </section>
  );
};

export default Dashboard;
