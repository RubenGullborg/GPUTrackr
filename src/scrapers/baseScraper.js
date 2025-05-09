const axios = require("axios");
const cheerio = require("cheerio");
const Gpu = require("../models/gpu");
const logger = require("../utils/logger");

class BaseScraper {
  constructor(retailerName, baseUrl) {
    this.retailerName = retailerName;
    this.baseUrl = baseUrl;
  }

  // Abstrakt method
  async scrapeProductList(url) {
    throw new Error(
      "scrapeProductList scrapeSingleProduct must be implemented by subclass"
    );
  }

  // Abstrakt method
  async scrapeSingleProduct(url) {
    throw new Error("scrapeSingleProduct must be implemented by subclass");
  }

  // Abstrakt method
  async findProductLinks(url) {
    throw new Error(
      "findProductLinks scrapeSingleProduct must be implemented by subclass"
    );
  }

  // Fælles metode til at hente HTML med Axios
  async fetchHtml(url) {
    try {
      const response = await axios.get(url);
      return cheerio.load(response.data);
    } catch (error) {
      logger.error(`Fejl ved hentning af HTML fra ${url}:`, error);
      throw error;
    }
  }

  // Fælles metode til at gemme eller opdatere GPU i databasen
  async saveGpu(gpuData) {
    try {
      const existingGpu = await Gpu.findOne({
        name: gpuData.name,
        retailer: this.retailerName,
      });

      if (existingGpu) {
        // Hvis prisen har ændret sig, tilføj til prishistorik
        if (existingGpu.currentPrice !== gpuData.currentPrice) {
          existingGpu.priceHistory.push({
            price: gpuData.currentPrice,
          });
        }

        // Opdater eksisterende GPU
        existingGpu.currentPrice = gpuData.currentPrice;
        existingGpu.inStock = gpuData.inStock;
        existingGpu.lastUpdated = new Date();

        await existingGpu.save();
        logger.info(`Opdateret ${gpuData.name} fra ${this.retailerName}`);
        return existingGpu;
      } else {
        // Opret ny GPU
        const newGpu = new Gpu({
          ...gpuData,
          retailer: this.retailerName,
          priceHistory: [{ price: gpuData.currentPrice }],
        });

        await newGpu.save();
        logger.info(
          `Tilføjet ny GPU: ${gpuData.name} fra ${this.retailerName}`
        );
        return newGpu;
      }
    } catch (dbError) {
      logger.error(`Fejl ved gem/opdatering af GPU ${gpuData.name}:`, dbError);
      throw dbError;
    }
  }

  // Fælles metode til at udtrække model fra et produktnavn
  extractModel(name) {
    const modelRegex = /(RTX\s?\d{4}\s?(?:Ti)?|Radeon\s?RX\s?\d{4}\s?(?:XT)?)/i;
    const modelMatch = name.match(modelRegex);
    return modelMatch ? modelMatch[0] : "Unknown";
  }

  // Fælles metode til at udtrække brand fra et produktnavn
  extractBrand(name) {
    const brandRegex =
      /(ASUS|MSI|Gigabyte|EVGA|Zotac|Palit|Gainward|PNY|Inno3D)/i;
    const brandMatch = name.match(brandRegex);
    return brandMatch ? brandMatch[0] : "Unknown";
  }

  // Metode til at scrape baseret på specifik model
  async scrapeForModel(modelKey, modelUrl) {
    try {
      logger.info(
        `Starter ${this.retailerName} scrape for GPU model: ${modelKey}...`
      );
      const productLinks = await this.findProductLinks(modelUrl);

      logger.info(
        `Fandt ${productLinks.length} unikke produktlinks for ${modelKey} fra ${this.retailerName}`
      );

      const scrapedGpus = [];
      for (const link of productLinks) {
        const product = await this.scrapeSingleProduct(link);
        if (product) {
          scrapedGpus.push(product);
        }
      }

      logger.info(
        `Successfully scraped ${scrapedGpus.length} GPUs for ${modelKey} from ${this.retailerName}`
      );
      return scrapedGpus.length;
    } catch (error) {
      logger.error(
        `Fejl ved scraping af ${this.retailerName} for GPU model ${modelKey}:`,
        error.message
      );
      return 0;
    }
  }
}

module.exports = BaseScraper;
