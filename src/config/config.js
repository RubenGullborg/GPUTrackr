require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3000,
  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/gpu-trackr",
  },
  scrapers: {
    proshop: {
      baseUrl: "https://www.proshop.dk",
      gpuPath: "/grafikkort",
    },
  },
};
