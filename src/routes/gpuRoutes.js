const express = require('express');
const router = express.Router();
const Gpu = require("../models/gpu");

// All GPUs of a specific model
router.get('/model/:modelName', async (req, res) => {
  try {
    const gpus = await Gpu.find({ 
      model: req.params.modelName 
    }).sort({ currentPrice: 1 });
    
    res.json(gpus);
  } catch (error) {
    res.status(500).json({ error: 'Kunne ikke hente GPU data' });
  }
});

// All available models
router.get('/models', async (req, res) => {
  try {
    const models = await Gpu.distinct('model');
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: 'Kunne ikke hente modeller' });
  }
});

// All brands
router.get('/brands', async (req, res) => {
  try {
    const brands = await Gpu.distinct('brand');
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: 'Kunne ikke hente mærker' });
  }
});

// All retailers
router.get('/retailers', async (req, res) => {
  try {
    const retailers = await Gpu.distinct('retailer');
    res.json(retailers);
  } catch (error) {
    res.status(500).json({ error: 'Kunne ikke hente forhandlere' });
  }
});

module.exports = router;
