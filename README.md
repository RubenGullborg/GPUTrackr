
# 🧠 GPU Trackr

**GPU Trackr** is a public Node.js-based API that collects and compares current GPU prices from major Danish retailers.  
The goal is to help users find the best available prices and monitor price trends across multiple sources.

---

## 🛠️ Features

- Scrapes live GPU listings from Danish tech shops
- Stores data in MongoDB for fast querying
- Exposes a RESTful API to access current GPU data
- Scheduled background scraping for fresh data
- Designed to be lightweight, fast, and open

---

## 📦 Tech Stack

- **Node.js** + **Express.js**
- **MongoDB**
- **Cheerio** / **Puppeteer** (depending on retailer)
- **Render** for hosting and job scheduling

---

## 📍 Current Scope

- ✅ Basic scraping and data collection
- ✅ API endpoints for listing and querying GPUs
- ✅ Support for popular Danish retailers

(And yes, only *NVIDIA cards* for now – AMD users, don't @ me.)

---

## 📅 Roadmap

- Add every major **NVIDIA card** model
- Include more Danish **retailers**
- Track **price history** over time
- Add alerts or webhooks for **price drops**
- Optional frontend interface

---

## 🧪 Example API Endpoints *(WIP)*

- `GET /gpus` – List all available GPUs
- `GET /gpus/:model` – Get prices for a specific model
- `GET /retailers` – See which shops are supported

---

## 📄 License

GNU – General Public License v3.0


---

> Because comparing GPU prices shouldn’t require 6 tabs and a spreadsheet.
