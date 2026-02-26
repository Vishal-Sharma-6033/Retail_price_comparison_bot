import { useCallback, useState } from "react";
import SearchBar from "../components/SearchBar.jsx";
import ComparisonTable from "../components/ComparisonTable.jsx";
import ChatbotPanel from "../components/ChatbotPanel.jsx";
import PriceTrendChart from "../components/PriceTrendChart.jsx";
import { chatbotApi, priceApi, productApi, shopApi } from "../api/client.js";

const Home = () => {
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [messages, setMessages] = useState([]);
  const [coords, setCoords] = useState(null);

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
      setCoords({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    });
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
          <SearchBar onSearch={handleSearch} onUseLocation={handleUseLocation} />
        </div>
      </div>
      <div className="grid">
        <ComparisonTable results={results} onSelect={handleSelectProduct} />
        <PriceTrendChart history={history} product={selectedProduct} />
      </div>
      <div className="grid">
        <ChatbotPanel messages={messages} onSend={handleChatSend} />
        <div className="card insight">
          <div className="card-title">Insights</div>
          <p>
            Track price drops by adding products to your watchlist in your profile once the
            UI is connected to your account.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Home;
