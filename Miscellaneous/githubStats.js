// githubStats.js
async function githubStatsRoutes(fastify, options) {
  fastify.get("/top-langs", async (request, reply) => {
    const githubAPIUrl =
      "https://github-readme-stats.vercel.app/api/top-langs/?username=Kartavya904&langs_count=8&layout=compact&theme=react&hide_border=true&bg_color=1F222E&title_color=F85D7F&icon_color=F8D866&hide=Jupyter%20Notebook,Roff";
    try {
      const fetch = (await import("node-fetch")).default;
      const response = await fetch(githubAPIUrl, {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch data from GitHub API: ${response.status}`
        );
      }
      const svg = await response.text();
      reply.header("Content-Type", "image/svg+xml").send(svg);
    } catch (error) {
      console.error("Error fetching GitHub stats:", error.message);
      reply.status(500).send("Failed to fetch GitHub stats");
    }
  });
}

module.exports = githubStatsRoutes;
