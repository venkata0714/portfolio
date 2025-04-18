// routes/aiRoutes.js
const {
  updateDbContextFile,
  updateGithubContextFile,
  updateResumeContextFile,
  buildMemoryIndex,
  askLLM,
} = require("../controllers/aiContextManager");

async function aiRoutes(fastify, options) {
  fastify.get("/", async (request, reply) => {
    return reply.send({ message: "AI Routes are working!" });
  });

  // Endpoint to manually trigger (re)creation of index and context updates
  fastify.route({
    method: ["GET", "POST"],
    url: "/create-index",
    handler: async (request, reply) => {
      try {
        // Regenerate all context files and the memory index
        await updateDbContextFile();
        await updateGithubContextFile();
        await updateResumeContextFile();
        // Force rebuild memory index to incorporate updated context
        await buildMemoryIndex(true);
        reply.send({
          message: "Context files updated and memory index built successfully.",
        });
      } catch (error) {
        console.error("Error creating index:", error);
        reply.code(500).send({ error: error.message });
      }
    },
  });

  // Endpoint to ask a question to the AI using the indexed context
  fastify.post("/ask-chat", async (request, reply) => {
    try {
      const { query } = request.body;
      if (!query || query.trim().length === 0) {
        return reply.code(400).send({ message: "Query cannot be empty." });
      }
      const answer = await askLLM(query);
      reply.send({ answer });
    } catch (error) {
      console.error("Error handling /ask-chat:", error);
      reply.code(500).send({ error: error.message });
    }
  });
}

module.exports = aiRoutes;
