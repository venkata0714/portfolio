// server.js
const fastify = require("fastify")({ logger: true });
const dotenv = require("dotenv");
dotenv.config();

const path = require("path");
const cors = require("@fastify/cors");
const cookie = require("@fastify/cookie");
const { connectDB } = require("./config/mongodb");

const githubStatsRoutes = require("./githubStats");
const dataRoutes = require("./routes/dataRoutes");
const pingRoutes = require("./ping"); // Import your ping plugin
const verifyJWT = require("./controllers/middlewareController");

// Register CORS with allowed origins.
fastify.register(cors, {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "https://kartavya-portfolio-mern-frontend.onrender.com",
      "https://kartavya-singh.com",
      "http://localhost:3000",
      "http://localhost:3001",
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"), false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allow PUT (and others)
});

// Register cookie support.
fastify.register(cookie);

// Connect to MongoDB.
connectDB();

// Register routes. (Fastify plugins are registered with a prefix.)
fastify.register(dataRoutes, { prefix: "/api" });
fastify.register(githubStatsRoutes, { prefix: "/api/github-stats" });
fastify.register(pingRoutes, { prefix: "/api" }); // Now /api/ping is available
fastify.get(
  "/api/check-cookie",
  { preHandler: verifyJWT },
  async (request, reply) => {
    reply.send({
      message: "Protected Cookie. Logged In as Admin!",
      valid: true,
      user: request.user,
    });
  }
);

// Root endpoints.
fastify.get("/", async (request, reply) => {
  reply.send("Welcome to Kartavya's MERN Portfolio Backend");
});

fastify.get("/api", async (request, reply) => {
  reply.send(
    "This is the API track for Kartavya's MERN Portfolio Backend. Explore our various endpoints to interact with the data and services provided."
  );
});

// Global error handler.
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  reply.status(500).send({ error: "Internal Server Error" });
});

// Start the server.
const PORT = process.env.PORT || 5000;
fastify.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server running on ${address}`);
});
