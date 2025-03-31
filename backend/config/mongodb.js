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
// Internal counters for DB operations (for logging)
let dbOpsCount = 0;
let dbOpsByCollection = {};

/**
 * Connect to MongoDB and set up the database connection.
 */
const connectDB = async () => {
  try {
    await client.connect();
    let rawDb = client.db("KartavyaPortfolioDB"); // replace with your database name
    console.log("Connected to MongoDB");

    // Wrap the DB instance in a Proxy to count operations per collection
    db = new Proxy(rawDb, {
      get(target, prop) {
        if (prop === "collection") {
          return function (...args) {
            const collName = args[0];
            const collection = target.collection.apply(target, args);
            // Return a proxy for the collection to intercept DB operations
            return new Proxy(collection, {
              get(collTarget, collProp) {
                const originalMethod = collTarget[collProp];
                if (
                  typeof originalMethod === "function" &&
                  [
                    "find",
                    "findOne",
                    "insertOne",
                    "insertMany",
                    "updateOne",
                    "updateMany",
                    "deleteOne",
                    "deleteMany",
                    "countDocuments",
                    "aggregate",
                  ].includes(collProp)
                ) {
                  return function (...methodArgs) {
                    // Increment global counters for DB metrics
                    dbOpsCount++;
                    dbOpsByCollection[collName] =
                      (dbOpsByCollection[collName] || 0) + 1;
                    // Call the original method
                    return originalMethod.apply(collTarget, methodArgs);
                  };
                }
                return originalMethod;
              },
            });
          };
        }
        return target[prop];
      },
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

/**
 * Get the connected database instance.
 */
const getDB = () => db;

/**
 * Get current database metrics (operation counts).
 */
const getDBMetrics = () => ({
  dbOpsCount,
  dbOpsByCollection,
});

/**
 * Reset the collected database metrics (to be called after each logging interval).
 */
const resetDBMetrics = () => {
  dbOpsCount = 0;
  dbOpsByCollection = {};
};

module.exports = { connectDB, getDB, getDBMetrics, resetDBMetrics };
