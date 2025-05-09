const express = require('express');
const router = express.Router();
const scraperController = require('../controllers/scraperController');

// Scrape alle forhandlere
router.get('/all', scraperController.scrapeAllRetailers);

// Scrape et enkelt produkt
router.get('/product', scraperController.scrapeSingleProduct);

// Scrape alle produkter for en bestemt model
router.get('/model/:modelName', scraperController.scrapeModel);

module.exports = router;
