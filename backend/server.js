const os = require("os");
const express = require("express");
const useragent = require("express-useragent");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const { connectDB } = require("./config/mongodb");
const winston = require("winston");

dotenv.config();
const app = express();

// Create a Winston logger instance
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`
    )
  ),
  transports: [new winston.transports.Console()],
});

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(useragent.express());
app.use(cookieParser());
const allowedOrigins = [
  "https://kartavya-portfolio-mern-frontend.onrender.com",
  "https://kartavya-singh.com",
  "http://localhost:3000",
  "http://localhost:3001",
];

// Global counter for API calls for logging
let apiCallCount = 0;
const headerInterval = 20; // Change this value to print header every X API calls

// Comprehensive list of HTTP status codes
const statusDescriptions = {
  // 1xx Informational
  100: "Continue",
  101: "Switching Protocols",
  102: "Processing", // WebDAV
  103: "Early Hints",

  // 2xx Success
  200: "SUCCESS! OK",
  201: "Created",
  202: "Accepted",
  203: "Non-Authoritative Information",
  204: "No Content",
  205: "Reset Content",
  206: "Partial Content",
  207: "Multi-Status", // WebDAV
  208: "Already Reported", // WebDAV
  226: "IM Used", // HTTP Delta encoding

  // 3xx Redirection
  300: "Multiple Choices",
  301: "Moved Permanently",
  302: "Found",
  303: "See Other",
  304: "Not Modified",
  305: "Use Proxy",
  306: "Switch Proxy", // No longer used
  307: "Temporary Redirect",
  308: "Permanent Redirect",

  // 4xx Client Errors
  400: "Bad Request",
  401: "Unauthorized",
  402: "Payment Required",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  406: "Not Acceptable",
  407: "Proxy Authentication Required",
  408: "Request Timeout",
  409: "Conflict",
  410: "Gone",
  411: "Length Required",
  412: "Precondition Failed",
  413: "Payload Too Large",
  414: "URI Too Long",
  415: "Unsupported Media Type",
  416: "Range Not Satisfiable",
  417: "Expectation Failed",
  418: "I'm a teapot", // RFC 2324 (Easter Egg)
  421: "Misdirected Request",
  422: "Unprocessable Entity", // WebDAV
  423: "Locked", // WebDAV
  424: "Failed Dependency", // WebDAV
  425: "Too Early",
  426: "Upgrade Required",
  428: "Precondition Required",
  429: "Too Many Requests",
  431: "Request Header Fields Too Large",
  451: "Unavailable For Legal Reasons",

  // 5xx Server Errors
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
  505: "HTTP Version Not Supported",
  506: "Variant Also Negotiates",
  507: "Insufficient Storage", // WebDAV
  508: "Loop Detected", // WebDAV
  510: "Not Extended",
  511: "Network Authentication Required",
};

// Custom logging middleware
app.use((req, res, next) => {
  const startTime = process.hrtime(); // Start high-resolution timer

  // Override res.send to capture response body
  const originalSend = res.send;
  res.send = function (body) {
    res.locals.body = body;
    return originalSend.call(this, body);
  };

  // When the response finishes, log the details
  res.on("finish", () => {
    const diff = process.hrtime(startTime);
    const latencyMs = diff[0] * 1000 + diff[1] / 1e6;

    // Increment API call counter
    apiCallCount++;

    // Construct the log object
    const logData = {
      // Timestamp: new Date().toISOString(),
      Endpoint: req.originalUrl,
      Method: req.method,
      // RequestHeaders: JSON.stringify(req.headers, null, 2),
      // QueryParameters: JSON.stringify(req.query, null, 2),
      // RequestBody: JSON.stringify(req.body, null, 2),
      ResponseStatus: res.statusCode,
      StatusDescription: statusDescriptions[res.statusCode] || "Unknown Status",
      // ResponseBody: res.locals.body,
      ClientIP: req.ip || req.connection.remoteAddress,
      DeviceType: req.useragent?.platform || "Unknown",
      Browser: req.useragent?.browser || req.headers["user-agent"] || "Unknown",
      Latency: `${latencyMs.toFixed(2)} ms`,
    };

    // Add at the top of your file (if not already present)
    const Table = require("cli-table3");

    // Log API call details using cli-table3
    const table = new Table({
      colWidths: [30, 8, 25, 20, 25, 20, 12],
      // Remove borders and padding for a clean, advanced look
      style: { head: [], border: [] },
      chars: {
        top: "",
        "top-mid": "",
        "top-left": "",
        "top-right": "",
        bottom: "",
        "bottom-mid": "",
        "bottom-left": "",
        "bottom-right": "",
        left: "",
        "left-mid": "",
        mid: "",
        "mid-mid": "",
        right: "",
        "right-mid": "",
        middle: " ",
      },
    });
    table.push([
      logData.Endpoint.replaceAll(" ", ""),
      logData.Method,
      logData.ResponseStatus + " " + logData.StatusDescription,
      logData.ClientIP,
      logData.DeviceType,
      logData.Browser,
      logData.Latency,
    ]);
    logger.info(table.toString());

    // Every 'headerInterval' API calls, log header for clarity
    if (apiCallCount % headerInterval === 0) {
      logger.info(
        "\n\t\t\t Endpoint:\t\t\t  Method:  Status:\t\t     ClientIP:\t\t  DeviceType:\t\t    Browser:\t\tLatency:\t\t"
      );
    }
  });

  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
// Connect to MongoDB
connectDB();

// Define routes
const dataRoutes = require("./routes/dataRoutes");
app.use("/api", dataRoutes);

// Add a new route for fetching GitHub stats
app.get("/api/top-langs", async (req, res) => {
  const githubAPIUrl =
    "https://github-readme-stats.vercel.app/api/top-langs/?username=Kartavya904&langs_count=8&layout=compact&theme=react&hide_border=true&bg_color=1F222E&title_color=F85D7F&icon_color=F8D866&hide=Jupyter%20Notebook,Roff";

  try {
    const fetch = (await import("node-fetch")).default; // Dynamic import
    const response = await fetch(githubAPIUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch data from GitHub API: ${response.status}`
      );
    }

    const svg = await response.text(); // Fetch as text since it returns an SVG
    res.set("Content-Type", "image/svg+xml");
    res.status(200).send(svg);
  } catch (error) {
    console.error("Error fetching GitHub stats:", error.message);
    res.status(500).send("Failed to fetch GitHub stats");
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

app.set("case sensitive routing", false);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // // Log more server details in a single line every 5 seconds
  // setInterval(() => {
  //   const memUsage = process.memoryUsage(); // returns an object with multiple memory usage stats
  //   const usedRSSMB = Math.round(memUsage.rss / 1024 / 1024);
  //   const usedHeapMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  //   const totalHeapMB = Math.round(memUsage.heapTotal / 1024 / 1024);
  //   const loadAvg1Min = os.loadavg()[0].toFixed(20); // 1-minute load average
  //   const uptimeSecs = process.uptime().toFixed(0); // Node process uptime in seconds
  //
  //   console.log(
  //     `Memory: RSS=${usedRSSMB}MB HeapUsed=${usedHeapMB}MB/${totalHeapMB}MB | CPU Load(1m)=${loadAvg1Min} | Uptime=${uptimeSecs}s`
  //   );
  // }, 5000);
});

// New: Log backend and database metrics every 20 seconds (20000 ms)
setInterval(async () => {
  // ---------------- Backend Metrics ----------------
  const memUsage = process.memoryUsage(); // returns an object with multiple memory usage stats
  const usedRSSMB = Math.round(memUsage.rss / 1024 / 1024);
  const totalSystemMemMB = Math.round(os.totalmem() / 1024 / 1024);
  const rssPercentage = ((usedRSSMB / totalSystemMemMB) * 100).toFixed(1);

  const usedHeapMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  const totalHeapMB = Math.round(memUsage.heapTotal / 1024 / 1024);
  const heapPercentage =
    totalHeapMB > 0 ? ((usedHeapMB / totalHeapMB) * 100).toFixed(1) : "N/A";

  // New Backend Metric: CPU Time (cumulative user+system CPU time) and Active Handles
  const cpuUsage = process.cpuUsage();
  const totalCpuSec = ((cpuUsage.user + cpuUsage.system) / 1e6).toFixed(2);
  const activeHandles = process._getActiveHandles().length;

  const uptimeSecs = process.uptime().toFixed(0); // Node process uptime in seconds

  // Updated Backend Metrics Order: Memory (RSS) | Heap Usage | CPU Time | Active Handles | Uptime
  console.log(
    `---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------`
  );
  logger.info(
    `Backend Metrics  | Memory (RSS): ${usedRSSMB} MB / ${totalSystemMemMB} MB (${rssPercentage}%)\t | Heap Usage: ${usedHeapMB} MB / ${totalHeapMB} MB (${heapPercentage}%)\t | CPU Time: ${totalCpuSec} seconds\t | Active Handles: ${activeHandles}\t\t | Uptime: ${uptimeSecs} seconds\t\t|`
  );

  // Uncomment below to see Backend Metrics in table format
  // const backendMetrics = [
  //   {
  //     "Memory (RSS)": `${usedRSSMB} MB / ${totalSystemMemMB} MB (${rssPercentage}%)`,
  //     "Heap Usage": `${usedHeapMB} MB / ${totalHeapMB} MB (${heapPercentage}%)`,
  //     "CPU Time": `${totalCpuSec} seconds`,
  //     "Active Handles": activeHandles,
  //     "Uptime": `${uptimeSecs} seconds`
  //   },
  // ];
  // console.log("\nBackend Metrics (every 20 seconds):");
  // console.table(backendMetrics);

  // ---------------- Database Metrics ----------------
  try {
    const db = require("./config/mongodb").getDB();
    if (db) {
      const adminDb = db.admin();
      const serverStatus = await adminDb.serverStatus();
      const connections = serverStatus.connections;
      // Calculate a new metric: Total Operations (sum of all operation counters)
      const opcounters = serverStatus.opcounters;
      const totalOps =
        opcounters.insert +
        opcounters.query +
        opcounters.update +
        opcounters.delete +
        opcounters.getmore +
        opcounters.command;
      const dbUptime = serverStatus.uptime; // DB uptime in seconds

      // New metric: Database Requests (if available)
      const network = serverStatus.network || {};
      const dbRequests =
        network.numRequests !== undefined ? network.numRequests : "N/A";

      // New metric: Available Storage in the Database (explicitly converting BigInt to Number)
      const dbStats = await db.stats({ freeStorage: 1, scale: 10750 });
      // console.log(dbStats);
      const storageSizeMB = Math.round(Number(dbStats.storageSize), 2);
      const dataSizeMB = Math.round(Number(dbStats.dataSize) / 102.4, 2);
      const availableStorageMB = storageSizeMB - dataSizeMB;

      // Updated Database Metrics Order: Current Connections | DB Requests | Total Ops | Available | DB Uptime
      logger.info(
        `Database Metrics | Current Connections: ${connections.current}\t\t\t | DB Requests: ${dbRequests}\t\t\t | Total Ops: ${totalOps} ops\t\t | Available: ${availableStorageMB} MB / ${storageSizeMB} MB\t | DB Uptime: ${dbUptime} seconds\t|`
      );

      console.log(
        `---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------`
      );

      // Uncomment below to see Database Metrics in table format
      // const dbMetrics = [
      //   {
      //     "Current Connections": connections.current,
      //     "DB Requests": dbRequests,
      //     "Total Operations": `${totalOps} ops`,
      //     "Available": `${availableStorageMB} MB / ${storageSizeMB} MB`,
      //     "DB Uptime": `${dbUptime} seconds`
      //   },
      // ];
      // console.log("\nDatabase Metrics (every 20 seconds):");
      // console.table(dbMetrics);
    } else {
      logger.warn("Database Metrics | No DB connection available.");
    }
  } catch (error) {
    logger.error(
      "Database Metrics | Error fetching DB metrics: " + error.message
    );
  }
}, 30000);
