// config/mongodb.js
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db;

const connectDB = async () => {
  try {
    await client.connect();
    db = client.db("KartavyaPortfolioDB"); // Replace with your database name
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const getDB = () => db;

module.exports = { connectDB, getDB };
