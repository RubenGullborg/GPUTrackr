require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
const gpuRoutes = require("./routes/gpuRoutes");
const scraperRoutes = require("./routes/scraperRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Forbind til MongoDB
connectDB().catch((err) => {
  console.error("Kunne ikke forbinde til MongoDB:", err);
  process.exit(1);
});

// API routes
app.use('/api/gpus', gpuRoutes);
app.use('/api/scrape', scraperRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server kører på http://localhost:${PORT}`);
});
