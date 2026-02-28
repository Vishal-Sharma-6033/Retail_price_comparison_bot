import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import SearchBar from "../components/SearchBar.jsx";
import ComparisonTable from "../components/ComparisonTable.jsx";
import ChatbotPanel from "../components/ChatbotPanel.jsx";
import PriceTrendChart from "../components/PriceTrendChart.jsx";
import { chatbotApi, priceApi, productApi, shopApi, userApi } from "../api/client.js";

const Home = () => {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [messages, setMessages] = useState([]);
  const [coords, setCoords] = useState(null);
  const [watchlistIds, setWatchlistIds] = useState([]);
  const [locationStatus, setLocationStatus] = useState("");

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLocationStatus("Getting your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCoords(newCoords);
        setLocationStatus(`Location acquired: ${newCoords.lat.toFixed(4)}, ${newCoords.lng.toFixed(4)}`);
        setTimeout(() => setLocationStatus(""), 3000);
      },
      (error) => {
        let errorMsg = "Unable to get your location. ";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += "Please allow location access in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg += "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMsg += "Location request timed out.";
            break;
          default:
            errorMsg += "An unknown error occurred.";
        }
        setLocationStatus(errorMsg);
        alert(errorMsg);
        setTimeout(() => setLocationStatus(""), 5000);
      },
      {
        timeout: 10000,
        enableHighAccuracy: true,
        maximumAge: 0
      }
    );
  };

  const resolveCoordinates = async (address) => {
    if (!address) {
      return coords;
    }

    const response = await shopApi.geocode({ address });
    return response.data.location;
  };

  const handleSearch = useCallback(
    async ({ query, address }) => {
      try {
        const location = await resolveCoordinates(address);
        const response = await productApi.search({
          q: query,
          lat: location?.lat,
          lng: location?.lng
        });
        setResults(response.data.results || []);
        if (response.data.results?.length) {
          setSelectedProduct(response.data.results[0].product);
          const historyResponse = await priceApi.history(response.data.results[0].product._id);
          setHistory(historyResponse.data.history || []);
          setAnalytics(historyResponse.data.analytics || null);
        }
      } catch (error) {
        setResults([]);
      }
    },
    [coords]
  );

  const handleSelectProduct = async (product) => {
    setSelectedProduct(product);
    const response = await priceApi.history(product._id);
    setHistory(response.data.history || []);
    setAnalytics(response.data.analytics || null);
  };

  const handleChatSend = async (text) => {
    setMessages((prev) => [...prev, { sender: "user", text }]);
    try {
      const response = await chatbotApi.query({
        question: text,
        lat: coords?.lat,
        lng: coords?.lng
      });
      setMessages((prev) => [...prev, { sender: "bot", text: response.data.answer }]);
    } catch (error) {
      setMessages((prev) => [...prev, { sender: "bot", text: "Try again soon." }]);
    }
  };

  const handleAddToWatchlist = async (productId) => {
    if (!user) {
      alert("Please login to add products to your watchlist.");
      return;
    }

    try {
      await userApi.addWatch({ productId });
      setWatchlistIds((prev) => [...prev, productId]);
    } catch (error) {
      console.error("Failed to add to watchlist:", error);
      alert("Failed to add to watchlist. Please try again.");
    }
  };

  useEffect(() => {
    const loadWatchlist = async () => {
      if (!user) return;
      try {
        const response = await userApi.watchlist();
        const ids = (response.data.watchlist || []).map((p) => p._id);
        setWatchlistIds(ids);
      } catch (error) {
        console.error("Failed to load watchlist:", error);
      }
    };

    loadWatchlist();
  }, [user]);

  return (
    <section className="page">
      <div className="hero">
        <div>
          <h1>Compare local prices instantly.</h1>
          <p>
            Search nearby shops, compare the latest prices, and ask the price bot for fast
            answers.
          </p>
        </div>
        <div className="hero-panel">
          <SearchBar onSearch={handleSearch} onUseLocation={handleUseLocation} locationStatus={locationStatus} />
        </div>
      </div>
      <div className="grid">
        <ComparisonTable
          results={results}
          onSelect={handleSelectProduct}
          onAddToWatchlist={user ? handleAddToWatchlist : null}
          watchlistIds={watchlistIds}
        />
        <PriceTrendChart history={history} product={selectedProduct} analytics={analytics} />
      </div>
      <div className="grid">
        <ChatbotPanel messages={messages} onSend={handleChatSend} />
        <div className="card insight">
          <div className="card-title">Insights</div>
          <p>
            {user
              ? `Track price drops by adding products to your watchlist. You have ${watchlistIds.length} product${watchlistIds.length === 1 ? "" : "s"} in your watchlist. Visit your profile to manage them.`
              : "Login to track price drops by adding products to your watchlist. Get notified when prices change on your favorite items."}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Home;
