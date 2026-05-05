const mongoose = require("mongoose");

const DEFAULT_MONGO_URI = "mongodb://127.0.0.1:27017/icn_security";

async function connectDB() {
  const mongoUri = process.env.MONGO_URI || DEFAULT_MONGO_URI;

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB холбогдлоо: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error("MongoDB холболтын алдаа:", error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
