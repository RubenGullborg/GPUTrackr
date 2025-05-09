const BaseScraper = require("./baseScraper");
const logger = require("../utils/logger");

class ElgigantenScraper extends BaseScraper {
  constructor() {
    super("Elgiganten", "https://www.elgiganten.dk");
  }

  // Implementering af findProductLinks metode fra BaseScraper
  async findProductLinks(url) {
    try {
      const $ = await this.fetchHtml(url);
      const productLinks = new Set();
      const baseUrl = new URL(url).origin;

      // Prøv forskellige selektorer, der potentielt kan matche produktlinks
      // Elgigantens produktkort-selector - nyeste struktur
      $('a[href*="/product/gaming/pc-komponenter/grafikkort-gpu"]').each((_, element) => {
        const link = $(element).attr("href");
        if (link) {
          productLinks.add(link.startsWith("http") ? link : baseUrl + link);
        }
      });

      // Hvis ingen produkter blev fundet, prøv en alternativ selector
      if (productLinks.size === 0) {
        $('a[href*="/grafikkort-gpu"]').each((_, element) => {
          const link = $(element).attr("href");
          if (link) {
            productLinks.add(link.startsWith("http") ? link : baseUrl + link);
          }
        });
      }

      // Hvis stadig ingen produkter, prøv en meget generel selector
      if (productLinks.size === 0) {
        $('a[data-test="product-link"]').each((_, element) => {
          const link = $(element).attr("href");
          if (link) {
            productLinks.add(link.startsWith("http") ? link : baseUrl + link);
          }
        });
      }

      logger.info(`Fandt ${productLinks.size} produktlinks fra ${url}`);
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

      // Produktnavn - opdateret selector baseret på Elgigantens HTML struktur
      const name = $('h1.font-regular.font-bold.text-balance.break-words').text().trim();

      // Pris - opdateret selector baseret på Elgigantens HTML struktur
      const priceText = $('span.font-headline.inc-vat').first().text().trim();
      const price = priceText
        ? parseFloat(
            priceText
              .replace(/[^0-9,]/g, "")
              .replace(".", "")
              .replace(",", ".")
          )
        : 0;

      // Lagerstatus - opdateret selector baseret på Elgigantens HTML struktur
      const stockText = $('div.flex.gap-4.text-sm[data-cro="store-stock"]').text().trim();
      const inStock = stockText ? !stockText.includes("Ikke på lager") : false;

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
        inStock,
      };

      // Log detaljerne for fejlfinding
      logger.info(`Fundet produkt: ${name}, Pris: ${price}, På lager: ${inStock}`);

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
      // Brug Elgigantens grafikkort-kategoriside
      const productLinks = await this.findProductLinks(
        `${this.baseUrl}/gaming/pc-komponenter/grafikkort-gpu`
      );

      logger.info(
        `Fandt ${productLinks.length} GPU-links fra ${this.retailerName}`
      );

      const scrapedGpus = [];
      for (const url of productLinks) {
        const product = await this.scrapeSingleProduct(url);
        if (product) {
          scrapedGpus.push(product);
        }
      }

      logger.info(
        `Fandt ${scrapedGpus.length} GPU'er fra ${this.retailerName}`
      );
      return scrapedGpus.length;
    } catch (error) {
      logger.error(`Fejl ved scraping af ${this.retailerName}:`, error);
      return 0;
    }
  }
}

module.exports = new ElgigantenScraper();
