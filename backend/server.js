const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB } = require("./config/mongodb");

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
