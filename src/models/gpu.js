const mongoose = require("mongoose");

// Pricehistory schema
const priceHistorySchema = new mongoose.Schema({
  price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// GPU schema
const gpuSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    brand: {
      type: String,
      index: true,
    },
    model: String,
    retailer: {
      type: String,
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
    },
    currentPrice: {
      type: Number,
      required: true,
      index: true,
    },
    inStock: {
      type: Boolean,
      default: false,
      index: true,
    },
    priceHistory: [priceHistorySchema],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index for unique product per retailer
gpuSchema.index({ name: 1, retailer: 1 }, { unique: true });

module.exports = mongoose.model("Gpu", gpuSchema);