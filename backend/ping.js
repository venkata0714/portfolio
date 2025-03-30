// ping.js
async function pingRoutes(fastify, options) {
  fastify.get("/ping", async (request, reply) => {
    try {
      // Get the database connection from your mongodb.js
      const db = require("./config/mongodb").getDB();
      if (!db) {
        throw new Error("Database connection not available");
      }
      // Execute a simple query. Here we use the "KartavyaPortfolio" collection as an example.
      const admin = await db.collection("KartavyaPortfolio").findOne();
      // If the query passes, both backend and database are working.
      reply.send({
        message: "Backend is active",
        database: "MongoDB is active",
        adminFound: admin ? true : false,
      });
    } catch (error) {
      reply.status(500).send({
        message: "Ping failed",
        error: error.message,
      });
    }
  });
}

module.exports = pingRoutes;
