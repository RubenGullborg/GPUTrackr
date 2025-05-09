const axios = require("axios");
const cheerio = require("cheerio");
const Gpu = require("../models/gpu");
const { gpuMarketUrls } = require("../data/productUrls");

const RETAILER = "Proshop";
const BASE_URL = "https://www.proshop.dk";
const GPU_LIST_URL = `${BASE_URL}/grafikkort`;


async function scrapeProshopForModel(gpuModelKey) {
  console.log(`Starting Proshop scrape for GPU model: ${gpuModelKey}...`);

  // 1. Find the Proshop URL for the given GPU model
  const proshopEntry = gpuMarketUrls[gpuModelKey]?.find(
    (entry) => entry.retailer.toLowerCase() === RETAILER.toLowerCase()
  );

  if (!proshopEntry || !proshopEntry.url) {
    console.error(
      `No URL found for ${RETAILER} and GPU model ${gpuModelKey} in gpuMarketUrls. Skipping.`
    );
    return 0; // Return 0 products found
  }

  const gpuListUrl = proshopEntry.url; // This is the specific URL from your gpuMarketUrls.js
  const baseUrl = new URL(gpuListUrl).origin; // Dynamically get base URL from the list URL

  console.log(`Scraping GPU list from: ${gpuListUrl}`);

  try {
    const response = await axios.get(gpuListUrl);
    const $ = cheerio.load(response.data);

    const productLinks = new Set(); // Use a Set to avoid duplicate links

    // --- SELECTOR FOR PRODUCT LINKS ON PROSHOP CATEGORY/SEARCH PAGE ---
    // This selector finds individual product cards or list items.
    // It needs to be robust for Proshop's structure.
    // Example: '.site-product-list .product-display-item a.site-product-link'
    // Or, as in your original code: $(".site-product-list .site-product-list-item")
    // You need to inspect Proshop's page for the correct selector that gives you links to individual product pages.
    // Let's use a common pattern, adjust if needed.
    $(
      'div.site-product-list-item a.site-product-link[href*="/Grafikkort/"]'
    ).each((index, element) => {
      const link = $(element).attr("href");
      if (link) {
        // Ensure the link is absolute
        const absoluteLink = link.startsWith("http") ? link : baseUrl + link;
        // Optional: Add a filter here if the search page returns irrelevant items
        // For example, check if the link text or a nearby element contains the gpuModelKey
        // const productName = $(element).find('.site-product-title').text().trim();
        // if (productName.includes(gpuModelKey.replace(/\s/g, ''))) { // Simple check
        productLinks.add(absoluteLink);
        // }
      }
    });
    // Fallback or alternative selector if the above doesn't work well for all Proshop pages
    if (productLinks.size === 0) {
      $(".site-product-list .site-product-list-item .site-product-link").each(
        (index, element) => {
          const path = $(element).attr("href");
          if (path && path.includes("/Grafikkort/")) {
            // Ensure it's a graphics card link
            const absoluteLink = path.startsWith("http")
              ? path
              : baseUrl + path;
            productLinks.add(absoluteLink);
          }
        }
      );
    }

    console.log(
      `Found ${productLinks.size} unique product links for ${gpuModelKey} from ${RETAILER}.`
    );

    const scrapedGpus = [];
    let count = 0;
    for (const link of productLinks) {
      // Optional: Limit the number of products scraped per model for testing
      // if (count >= 5) { // Scrape a max of 5 products per model for testing
      //   console.log(`Reached test limit for ${gpuModelKey} on ${RETAILER}.`);
      //   break;
      // }
      const product = await scrapeSingleProduct(link, RETAILER); // Pass RETAILER explicitly
      if (product) {
        scrapedGpus.push(product);
      }
      count++;
    }

    console.log(
      `Successfully scraped ${scrapedGpus.length} GPUs for ${gpuModelKey} from ${RETAILER}.`
    );
    return scrapedGpus.length; // Return the count of successfully scraped products
  } catch (error) {
    console.error(
      `Error scraping ${RETAILER} for GPU model ${gpuModelKey} from ${gpuListUrl}:`,
      error.message
    );
    return 0; // Return 0 on error
  }
}









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
    const response = await axios.get('https://www.proshop.dk/grafikkort');
    const $ = cheerio.load(response.data);
    const gpus = [];

    $('.site-product-list-item').each(async (_, element) => {
      const name = $(element).find('.site-product-title').text().trim();
      const price = parseFloat($(element).find('.site-currency-attention').text().replace(/[^0-9,]/g, '').replace(',', '.'));
      const url = $(element).find('a').attr('href');
      const inStock = $(element).find('.site-stock-label').text().includes('På lager');

      if (name && price) {
        const gpu = new Gpu({
          name,
          model: extractModel(name), // Hjælpefunktion til at udtrække model
          brand: extractBrand(name), // Hjælpefunktion til at udtrække brand
          retailer: 'Proshop',
          url,
          currentPrice: price,
          inStock,
          lastUpdated: new Date()
        });

        await gpu.save();
        gpus.push(gpu);
      }
    });

    return gpus;
  } catch (error) {
    console.error('Fejl ved scraping af Proshop:', error);
    return [];
  }
}

module.exports = { scrapeProshop, scrapeSingleProduct, scrapeProshopForModel };
