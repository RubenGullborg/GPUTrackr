const express = require('express');
const router = express.Router();
const scraperController = require('../controllers/scraperController');

router.get('/all', scraperController.scrapeAllRetailers);
router.get('/product', scraperController.scrapeSingleProduct);

module.exports = router;
