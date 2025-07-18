const os = require("os");
const fastify = require("fastify");
const dotenv = require("dotenv");
const path = require("path");
const useragent = require("express-useragent");
const fastifyStatic = require('@fastify/static');

dotenv.config();
const { connectDB, getDBMetrics, resetDBMetrics } = require("./config/mongodb");

const app = fastify({ logger: false, bodyLimit: 50 * 1024 * 1024 });

app.register(require("@fastify/cors"), {
  origin: [
    "https://portfolio-xv93.onrender.com/",
    "http://localhost:3000",
    "http://localhost:3001",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

app.register(require("@fastify/cookie"), {
  cookie: { path: "/", secure: true, httpOnly: true, sameSite: "none" },
});
app.register(require("@fastify/formbody"));

// === Register your API routes here ===
(async () => {
  try {
    await connectDB();

    app.register(require("./routes/dataRoutes"), { prefix: "/api" });
    app.register(require("./routes/aiRoutes"), { prefix: "/api/ai" });
    app.register(require("./routes/imagesRoutes"), { prefix: "/api/images" });

    const aiContextManager = require("./controllers/aiContextManager");
    await aiContextManager.initContext();
    console.log("✅ AI context initialized");

    // === Serve frontend static files ===
    app.register(fastifyStatic, {
      root: path.join(__dirname, "build"),
      prefix: "/",
    });

    // Fallback for React Router
    app.setNotFoundHandler((req, reply) => {
      reply.sendFile("index.html");
    });

    const PORT = process.env.PORT || 5000;
    await app.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`🚀 Server listening on port ${PORT}`);
  } catch (err) {
    console.error("❌ Startup failure:", err);
    process.exit(1);
  }
})();
