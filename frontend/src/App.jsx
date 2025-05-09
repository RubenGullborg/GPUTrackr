import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [gpus, setGpus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    brand: "",
    model: "",
    minPrice: "",
    maxPrice: "",
    inStock: "",
  });
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);

  useEffect(() => {
    loadGpus();
  }, []);

  useEffect(() => {
    if (gpus.length > 0) {
      // Udtrække unikke brands og modeller fra de faktiske GPU data
      const uniqueBrands = [...new Set(gpus.map((gpu) => gpu.brand))];
      const uniqueModels = [...new Set(gpus.map((gpu) => gpu.model))];
      setBrands(uniqueBrands);
      setModels(uniqueModels);
    }
  }, [gpus]);

  const loadGpus = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/gpus");
      const data = await response.json();
      setGpus(data);
    } catch (error) {
      console.error("Fejl ved hentning af GPU'er:", error);
    }
    setLoading(false);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const applyFilters = () => {
    const filteredGpus = gpus.filter((gpu) => {
      // Brand filter
      if (filters.brand && gpu.brand !== filters.brand) {
        return false;
      }

      // Model filter
      if (filters.model && !gpu.model.includes(filters.model)) {
        return false;
      }

      // Price filters
      if (filters.minPrice && gpu.currentPrice < Number(filters.minPrice)) {
        return false;
      }
      if (filters.maxPrice && gpu.currentPrice > Number(filters.maxPrice)) {
        return false;
      }

      // Stock filter
      if (filters.inStock === "true" && !gpu.inStock) {
        return false;
      }
      if (filters.inStock === "false" && gpu.inStock) {
        return false;
      }

      return true;
    });

    return filteredGpus;
  };

  const filteredGpus = applyFilters();

  return (
    <div className="container">
      <header>
        <h1>GPU Prisoversigt</h1>
      </header>

      <section className="filters">
        <div className="filter-group">
          <select
            value={filters.brand}
            onChange={(e) => handleFilterChange("brand", e.target.value)}
          >
            <option value="">Alle Brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>

          <select
            value={filters.model}
            onChange={(e) => handleFilterChange("model", e.target.value)}
          >
            <option value="">Alle Modeller</option>
            {models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Min. Pris"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange("minPrice", e.target.value)}
          />

          <input
            type="number"
            placeholder="Max. Pris"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
          />

          <select
            value={filters.inStock}
            onChange={(e) => handleFilterChange("inStock", e.target.value)}
          >
            <option value="">Alle</option>
            <option value="true">På lager</option>
            <option value="false">Ikke på lager</option>
          </select>

          <button onClick={loadGpus} className="refresh-btn">
            Opdater data
          </button>
        </div>
      </section>

      <div className="results-summary">
        {filteredGpus.length > 0 && (
          <p>Viser {filteredGpus.length} grafikkort {filters.brand && `fra ${filters.brand}`} {filters.model && `i ${filters.model} serien`}</p>
        )}
      </div>

      <section className="gpu-list">
        {loading ? (
          <div className="loading">Indlæser...</div>
        ) : filteredGpus.length > 0 ? (
          <div className="gpu-grid">
            {filteredGpus.map((gpu) => (
              <div key={gpu._id} className="gpu-card">
                <div className="gpu-header">
                  <span className="retailer-badge">{gpu.retailer}</span>
                  <span className={`stock-badge ${gpu.inStock ? "in-stock" : "out-of-stock"}`}>
                    {gpu.inStock ? "På lager" : "Ikke på lager"}
                  </span>
                </div>
                
                <h2 className="gpu-title" title={gpu.name}>{gpu.name}</h2>
                
                <div className="gpu-details">
                  <div className="brand-model">
                    <span className="brand">{gpu.brand}</span>
                    <span className="model-chip">{gpu.model}</span>
                  </div>
                  
                  <div className="price-container">
                    <span className="price">{gpu.currentPrice.toLocaleString('da-DK')} kr.</span>
                  </div>
                  
                  <a
                    href={gpu.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shop-button"
                  >
                    Se hos {gpu.retailer}
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            Ingen GPU'er matcher de valgte filtre
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
