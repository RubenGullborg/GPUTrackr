const proshopScraper = require('../scrapers/proshop');
const { gpuMarketUrls } = require('../data/productUrls');
const logger = require('../utils/logger');

// Factory til at få den rette scraper baseret på retailer navn
function getScraperForRetailer(retailerName) {
  const retailerMap = {
    'Proshop.dk': proshopScraper,
    // Tilføj flere scrapere her som du implementerer dem
  };
  
  return retailerMap[retailerName] || null;
}

class ScraperService {
  // Scrape alle forhandlere
  async scrapeAllRetailers() {
    try {
      // Foreløbig kun Proshop, men let at tilføje flere senere
      const results = await Promise.allSettled([
        proshopScraper.scrapeProductList()
      ]);
      
      return results.map((result, index) => {
        const retailer = index === 0 ? proshopScraper.retailerName : 'Unknown';
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

  // Scrape et enkelt produkt (uanset forhandler - vi bestemmer scraper baseret på URL)
  async scrapeSingleProduct(url) {
    try {
      // Automatisk bestemmelse af scraper baseret på URL
      const urlDomain = new URL(url).hostname;
      let scraper;
      
      if (urlDomain.includes('proshop.dk')) {
        scraper = proshopScraper;
      }
      // Tilføj flere forhandlere her
      
      if (!scraper) {
        logger.error(`Ingen scraper fundet for domæne: ${urlDomain}`);
        return null;
      }
      
      return await scraper.scrapeSingleProduct(url);
    } catch (error) {
      logger.error(`Fejl ved scraping af produkt (${url}):`, error);
      throw error;
    }
  }

  // Scrape alle produkter for en bestemt GPU model
  async scrapeForModel(modelName) {
    try {
      const modelUrls = gpuMarketUrls[modelName];
      if (!modelUrls || modelUrls.length === 0) {
        logger.error(`Ingen URLs fundet for model: ${modelName}`);
        return [];
      }
      
      const results = [];
      
      for (const entry of modelUrls) {
        const scraper = getScraperForRetailer(entry.retailer);
        if (scraper) {
          const count = await scraper.scrapeForModel(modelName, entry.url);
          results.push({
            retailer: entry.retailer,
            success: true,
            count
          });
        } else {
          results.push({
            retailer: entry.retailer,
            success: false,
            count: 0,
            error: `Ingen scraper implementeret for ${entry.retailer}`
          });
        }
      }
      
      return results;
    } catch (error) {
      logger.error(`Fejl ved scraping for model ${modelName}:`, error);
      throw error;
    }
  }
}

module.exports = new ScraperService();
