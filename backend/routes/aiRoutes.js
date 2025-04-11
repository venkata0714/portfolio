// routes/aiRoutes.js
const { getAnswer } = require("../controllers/aiChatBotManager");

async function aiRoutes(fastify, options) {
  // Allow both GET and POST requests to trigger index creation
  fastify.route({
    method: ["GET", "POST"],
    url: "/create-index",
    handler: async (request, reply) => {
      try {
        // Create the index in OpenSearch if it doesn't exist
        await createIndex();
        // Index the consolidated context (reads the JSON files, splits into chunks, and indexes them)
        await indexConsolidatedContext();
        reply.send({
          message:
            "Index created and consolidated context indexed successfully.",
        });
      } catch (error) {
        console.error("Error creating index:", error);
        reply.code(500).send({ error: error.message });
      }
    },
  });

  fastify.post("/ask-chat", async (request, reply) => {
    try {
      const { query } = request.body;
      if (!query || query.trim().length === 0) {
        return reply.code(400).send({ message: "Query cannot be empty." });
      }
      const result = await getAnswer(query);
      reply.send(result);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });
}

module.exports = aiRoutes;
