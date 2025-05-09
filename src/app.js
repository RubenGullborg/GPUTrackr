require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
const { scrapeSingleProduct } = require("./scrapers/proshop");
const gpuRoutes = require("./routes/gpuRoutes");


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/gpus", gpuRoutes);
// Forbind til MongoDB
connectDB().catch((err) => {
  console.error("Kunne ikke forbinde til MongoDB:", err);
  process.exit(1);
});


// API routes
app.get("/api/scrape/product", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "URL parameter mangler",
      });
    }

    const product = await scrapeSingleProduct(url);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Kunne ikke finde produkt på den angivne URL",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Fejl under scraping af produkt:", error);
    res.status(500).json({
      success: false,
      error: "Fejl under scraping af produkt",
    });
  }
});

// Rute til at hente alle GPU'er
app.get("/api/gpus", async (req, res) => {
  try {
    const Gpu = require("./models/gpu");
    const gpus = await Gpu.find({}).sort({ currentPrice: 1 });
    res.json(gpus);
  } catch (error) {
    console.error("Fejl ved hentning af GPU'er:", error);
    res.status(500).json({
      success: false,
      error: "Fejl ved hentning af GPU'er",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server kører på http://localhost:${PORT}`);
});
