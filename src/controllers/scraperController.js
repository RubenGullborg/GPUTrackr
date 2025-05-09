const scraperService = require('../services/scraperService');
const logger = require('../utils/logger');

class ScraperController {
    async scrapeAllRetailers(req, res) {
        try {
            const results = await scraperService.scrapeAllRetailers();
            res.json({
                success: true,
                results
            });
        } catch (error) {
            logger.error('Fejl i scrapeAllRetailers controller:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Fejl ved scraping af forhandlere' 
            });
        }
    }

    async scrapeSingleProduct(req, res) {
        try {
            const { url } = req.query;
            
            if (!url) {
                return res.status(400).json({
                    success: false,
                    error: 'URL parameter mangler'
                });
            }
            
            const product = await scraperService.scrapeSingleProduct(url);
            
            if (!product) {
                return res.status(404).json({
                    success: false,
                    error: 'Kunne ikke finde produkt på den angivne URL'
                });
            }
            
            res.json({
                success: true,
                data: product
            });
        } catch (error) {
            logger.error('Fejl i scrapeSingleProduct controller:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Fejl ved scraping af produkt' 
            });
        }
    }

    async scrapeModel(req, res) {
        try {
            const { modelName } = req.params;
            
            if (!modelName) {
                return res.status(400).json({
                    success: false,
                    error: 'Model navn parameter mangler'
                });
            }
            
            const results = await scraperService.scrapeForModel(modelName);
            
            res.json({
                success: true,
                model: modelName,
                results
            });
        } catch (error) {
            logger.error(`Fejl i scrapeModel controller for model ${req.params.modelName}:`, error);
            res.status(500).json({ 
                success: false, 
                error: 'Fejl ved scraping af model' 
            });
        }
    }
}

module.exports = new ScraperController();
