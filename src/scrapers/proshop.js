const BaseScraper = require('./baseScraper');
const logger = require('../utils/logger');

class ProshopScraper extends BaseScraper {
  constructor() {
    super('Proshop', 'https://www.proshop.dk');
  }

  // Implementering af findProductLinks metode fra BaseScraper
  async findProductLinks(url) {
    try {
      const $ = await this.fetchHtml(url);
      const productLinks = new Set();
      const baseUrl = new URL(url).origin;

      // Primær selector for produktlinks
      $('div.site-product-list-item a.site-product-link[href*="/Grafikkort/"]').each((_, element) => {
        const link = $(element).attr("href");
        if (link) {
          productLinks.add(link.startsWith("http") ? link : baseUrl + link);
        }
      });

      // Fallback selector hvis primær ikke finder links
      if (productLinks.size === 0) {
        $(".site-product-list .site-product-list-item .site-product-link").each((_, element) => {
          const path = $(element).attr("href");
          if (path && path.includes("/Grafikkort/")) {
            productLinks.add(path.startsWith("http") ? path : baseUrl + path);
          }
        });
      }

      return Array.from(productLinks);
    } catch (error) {
      logger.error(`Fejl ved hentning af produktlinks fra ${url}:`, error);
      return [];
    }
  }

  // Implementering af scrapeSingleProduct metode fra BaseScraper
  async scrapeSingleProduct(url) {
    try {
      logger.info(`Scraper produkt: ${url}`);
      const $ = await this.fetchHtml(url);
      
      // Produktnavn - opdateret selector
      const name = $('h1[data-type="product"]').text().trim();
      
      // Pris - .site-currency-attention
      const priceText = $(".site-currency-attention").first().text().trim();
      const price = priceText 
        ? parseFloat(priceText.replace(/[^0-9,]/g, "").replace(".", "").replace(",", "."))
        : 0;
      
      // Lagerstatus - .site-stock-label
      const stockText = $(".site-stock-label").text().trim();
      const inStock = stockText ? stockText.includes("På lager") : false;
      
      if (!name || price <= 0) {
        logger.warn(`Kunne ikke finde gyldigt produkt på ${url}`);
        return null;
      }
      
      // Udled brand og model fra navnet
      const brand = this.extractBrand(name);
      const model = this.extractModel(name);
      
      const gpuData = {
        name,
        brand,
        model,
        url,
        currentPrice: price,
        inStock
      };
      
      // Gem GPU i databasen
      await this.saveGpu(gpuData);
      
      return gpuData;
    } catch (error) {
      logger.error(`Fejl ved scraping af produkt (${url}):`, error);
      return null;
    }
  }

  // Implementering af scrapeProductList metode fra BaseScraper
  async scrapeProductList() {
    try {
      logger.info(`Starter scraping af ${this.retailerName}...`);
      const productLinks = await this.findProductLinks(`${this.baseUrl}/grafikkort`);
      
      logger.info(`Fandt ${productLinks.length} GPU-links fra ${this.retailerName}`);
      
      const scrapedGpus = [];
      for (const url of productLinks) {
        const product = await this.scrapeSingleProduct(url);
        if (product) {
          scrapedGpus.push(product);
        }
      }

      logger.info(`Fandt ${scrapedGpus.length} GPU'er fra ${this.retailerName}`);
      return scrapedGpus.length;
    } catch (error) {
      logger.error(`Fejl ved scraping af ${this.retailerName}:`, error);
      return 0;
    }
  }
}

module.exports = new ProshopScraper();
