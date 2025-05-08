const mongoose = require("mongoose");

// MongoDB forbindelsesfunktion
async function connectDB() {
  try {
    const connectionString =
      process.env.MONGODB_URI || "mongodb://localhost:27017/gpu-trackr";

    await mongoose.connect(connectionString, {
      // Mongoose bruger automatisk de bedste indstillinger efter nyere versioner
    });

    console.log("MongoDB forbindelse etableret!");
    return true;
  } catch (error) {
    console.error("MongoDB forbindelsesfejl:", error);
    return false;
  }
}

module.exports = { connectDB };
