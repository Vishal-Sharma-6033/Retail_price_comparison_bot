import { useState } from "react";

const SearchBar = ({ onSearch, onUseLocation }) => {
  const [query, setQuery] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch({ query, address });
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-row">
        <input
          type="text"
          placeholder="Search products or brands"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          required
        />
        <button className="primary-btn" type="submit">
          Compare
        </button>
      </div>
      <div className="search-row secondary">
        <input
          type="text"
          placeholder="Enter a neighborhood or address"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
        />
        <button className="ghost-btn" type="button" onClick={onUseLocation}>
          Use my location
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
