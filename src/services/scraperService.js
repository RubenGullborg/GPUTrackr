const { scrapeProshop, scrapeSingleProduct } = require('../scrapers/proshop');
const logger = require('../utils/logger');

class ScraperService {
    async scrapeAllRetailers() {
        try {
            const results = await Promise.allSettled([
                scrapeProshop()
            ]);
            
            return results.map((result, index) => {
                const retailer = index === 0 ? 'Proshop' : 'Unknown';
                return {
                    retailer,
                    success: result.status === 'fulfilled',
                    count: result.status === 'fulfilled' ? result.value : 0,
                    error: result.status === 'rejected' ? result.reason : null
                };
            });
        } catch (error) {
            logger.error('Fejl ved scraping af alle forhandlere:', error);
            throw error;
        }
    }

    async scrapeSingleProduct(url) {
        try {
            return await scrapeSingleProduct(url);
        } catch (error) {
            logger.error(`Fejl ved scraping af produkt (${url}):`, error);
            throw error;
        }
    }
}

module.exports = new ScraperService();
