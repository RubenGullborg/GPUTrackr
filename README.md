# 🎮 GPU Trackr

**GPU Trackr** is a Node.js-based API that stalks GPU prices across Danish retailers so you don't have to open 15 browser tabs and lose your sanity.

> Because comparing GPU prices shouldn't require a spreadsheet, three monitors, and a mental breakdown.

## 🔍 What is this sorcery?

GPU Trackr scrapes various Danish tech retailers to find the best prices for graphics cards, because we know you're too busy gaming to do it yourself. We're not judging.

---

## ✨ Features

- 🕷️ **Automatic Scraping**: We do the boring work of checking prices across multiple stores
- 💾 **MongoDB Storage**: Excel is a bit too 2003
- 🔌 **RESTful API**: Easy access for developers who are too cool for manual price checking
- ⏰ **Scheduled Updates**: Fresh data without you having to go thru the troubles of pressing F5
- 🤓 **Price History**: Watch those prices drop (or more likely, stay ridiculously high)

---

## 🧰 Tech Stack

- **Node.js + Express**: Hate PHP
- **MongoDB**: NoSQL, because relationships are complicated enough in real life
- **Cheerio**: DOM manipulation without the browser overhead
- **Puppeteer**: More of the above

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB
- A desperate need to find a reasonably priced GPU
- Low expectations (this is the GPU market after all)

### Installation

1. Clone this repo
```
bash
git clone https://github.com/yourusername/GPUTrackr.git
cd GPUTrackr
```

2. Install dependencies
```
bash
npm install
```

3. Create a `.env` file

`````
PORT=3000
MONGODB_URI=mongodb://localhost:27017/gputrackr
````


4. Start the server
```
bash
npm start
```

5. Watch as your terminal fills with logs about overpriced GPUs

---

## 🌐 API Endpoints

### GPU Data

- `GET /api/gpus` – List all GPUs
- `GET /api/gpus/models` – List available GPU models 
- `GET /api/gpus/model/:modelName` – Get prices for a specific model
- `GET /api/gpus/:id` – Get detailed info about a specific GPU

### Scraping Operations

- `GET /api/scrape/all` – Trigger a full scrape
- `GET /api/scrape/product?url=URL` – Scrape a single product
- `GET /api/scrape/model/:modelName` – Scrape all sources for a specific model

---

## 📊 Current Scope

- ✅ **NVIDIA RTX Series**:
- ✅ **Multiple Danish Retailers**: Proshop, Elgiganten, and more to come
- ✅ **Real-time Price Comparison**: Find the least terrible deals

---

## 🛣️ Roadmap

- Add more **GPU models** (yes, even AMD, eventually)
- Support more **retailers** to maximize the chance of finding a unicorn deal
- Implement **price alerts** so you can rush to buy before crypto miners do
- Create a proper **frontend** because APIs aren't user-friendly for normal humans and right now its some monkey business
- Add **historical price charts** to visualize how much we're being price-gouged

---

## 🤓 For Developers

Want to add a new retailer? Check out our scraper architecture:

1. Extend the `BaseScraper` class
2. Implement the required methods with your retailer-specific selectors
3. Register your scraper in the `scraperService`
4. Congratulations, you've just made GPU shopping 0.01% less painful!

---

## 📄 License

GNU General Public License v3.0

---

## 🙏 Acknowledgements

- The Danish tech retailers for making their websites just scrape-able enough
- The GPU manufacturers for... well, making GPUs? (though we wish they'd make more)

---

*Built with ❤️, 😭, and too much caffeine.*