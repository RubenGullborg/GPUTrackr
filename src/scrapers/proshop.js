const axios = require("axios");
const cheerio = require("cheerio");
const Gpu = require("../models/gpu");

const RETAILER = "Proshop";
const BASE_URL = "https://www.proshop.dk";
const GPU_LIST_URL = `${BASE_URL}/grafikkort`;

// Funktion til at scrape et enkelt produkt
async function scrapeSingleProduct(url) {
  try {
    console.log(`Scraper produkt: ${url}`);
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // Debug logging
    console.log('HTML indhold:');
    console.log('Produktnavn element:', $('h1[data-type="product"]').length);
    console.log('Pris element:', $('.site-currency-attention').length);
    console.log('Lagerstatus element:', $('.site-stock-label').length);
    
    // Produktnavn - opdateret selector
    const name = $('h1[data-type="product"]').text().trim();
    console.log('Fundet navn:', name);
    
    // Pris - .site-currency-attention
    const priceText = $(".site-currency-attention").first().text().trim();
    console.log('Fundet pris tekst:', priceText);
    const price = priceText 
      ? parseFloat(priceText.replace(/[^0-9,]/g, "").replace(".", "").replace(",", "."))
      : 0;
    console.log('Parsed pris:', price);
    
    // Lagerstatus - .site-stock-label
    const stockText = $(".site-stock-label").text().trim();
    console.log('Fundet lagerstatus tekst:', stockText);
    const inStock = stockText ? stockText.includes("På lager") : false;
    console.log('På lager:', inStock);
    
    if (!name || price <= 0) {
      console.log(`Kunne ikke finde gyldigt produkt på ${url}`);
      return null;
    }
    
    // Udled brand fra navnet
    const brandRegex = /(ASUS|MSI|Gigabyte|EVGA|Zotac|Palit|Gainward|PNY|Inno3D)/i;
    const brandMatch = name.match(brandRegex);
    const brand = brandMatch ? brandMatch[0] : "Unknown";
    
    // Udled model fra navnet
    const modelRegex = /(RTX\s?\d{4}\s?(?:Ti)?|Radeon\s?RX\s?\d{4}\s?(?:XT)?)/i;
    const modelMatch = name.match(modelRegex);
    const model = modelMatch ? modelMatch[0] : "Unknown";
    
    const gpuData = {
      name,
      brand,
      model,
      retailer: RETAILER,
      url,
      currentPrice: price,
      inStock
    };
    
    // Gem eller opdater i databasen
    try {
      const existingGpu = await Gpu.findOne({ name: name, retailer: RETAILER });
      
      if (existingGpu) {
        // Hvis prisen har ændret sig, tilføj til prishistorik
        if (existingGpu.currentPrice !== price) {
          existingGpu.priceHistory.push({
            price: price
          });
        }
        
        // Opdater eksisterende GPU
        existingGpu.currentPrice = price;
        existingGpu.inStock = inStock;
        existingGpu.lastUpdated = new Date();
        
        await existingGpu.save();
        console.log(`Opdateret ${name} fra ${RETAILER}`);
      } else {
        // Opret ny GPU
        const newGpu = new Gpu({
          ...gpuData,
          priceHistory: [{ price: price }]
        });
        
        await newGpu.save();
        console.log(`Tilføjet ny GPU: ${name} fra ${RETAILER}`);
      }
    } catch (dbError) {
      console.error(`Fejl ved gem/opdatering af GPU ${name}:`, dbError);
    }
    
    return gpuData;
  } catch (error) {
    console.error(`Fejl ved scraping af produkt (${url}):`, error);
    throw error;
  }
}

// Funktion til at scrape alle GPU'er fra Proshop
async function scrapeProshop() {
  try {
    console.log(`Starter scraping af ${RETAILER}...`);
    const response = await axios.get(GPU_LIST_URL);
    const $ = cheerio.load(response.data);

    const gpuLinks = [];
    const gpus = [];

    // Find links til alle GPU produktsider
    $(".site-product-list .site-product-list-item").each((index, element) => {
      try {
        // Produktnavn fra listevisning - bruges kun til filtrering
        const nameInList = $(element).find(".site-product-title").text().trim();
        
        // Kun fortsæt hvis navnet indeholder "RTX" eller "Radeon" for at filtrere GPU'er
        if (nameInList && (nameInList.includes("RTX") || nameInList.includes("Radeon"))) {
          // Produktlink
          const urlPath = $(element).find(".site-product-title a").attr("href");
          const url = urlPath ? (urlPath.startsWith("http") ? urlPath : BASE_URL + urlPath) : "";
          
          if (url) {
            gpuLinks.push(url);
          }
        }
      } catch (itemError) {
        console.error(`Fejl ved parsing af produktlink:`, itemError);
      }
    });

    console.log(`Fandt ${gpuLinks.length} GPU-links fra ${RETAILER}`);
    
    // Besøg hver produktside for mere detaljer
    for (const url of gpuLinks.slice(0, 10)) { // Begræns til 10 for test
      try {
        const product = await scrapeSingleProduct(url);
        if (product) {
          gpus.push(product);
        }
      } catch (productError) {
        console.error(`Fejl ved scraping af produkt (${url}):`, productError);
      }
    }

    console.log(`Fandt ${gpus.length} GPU'er fra ${RETAILER}`);
    return gpus.length;
  } catch (error) {
    console.error(`Fejl ved scraping af ${RETAILER}:`, error);
    throw error;
  }
}

module.exports = { scrapeProshop, scrapeSingleProduct };
