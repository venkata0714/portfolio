const express = require("express");
const router = express.Router();
// Define a helper function for fetching using dynamic import
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

// Environment variables for GitHub credentials
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const PER_PAGE = 100; // maximum number of repos per page

// Helper function: fetch all repositories (with pagination)
async function fetchAllRepos() {
  let repos = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `https://api.github.com/user/repos?per_page=${PER_PAGE}&page=${page}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch repos: ${response.status}`);
    }
    const data = await response.json();
    repos = repos.concat(data);
    if (data.length < PER_PAGE) {
      hasMore = false;
    } else {
      page++;
    }
  }
  return repos;
}

// Helper function: fetch language data for a single repository
async function fetchRepoLanguages(languagesUrl) {
  const response = await fetch(languagesUrl, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
  });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch languages from ${languagesUrl}: ${response.status}`
    );
  }
  return response.json();
}

// Route to aggregate and return top 6 languages with percentage share
router.get("/top-langs", async (req, res) => {
  try {
    const repos = await fetchAllRepos();
    let languageTotals = {};
    let totalBytes = 0;

    // Fetch language data concurrently for all repositories
    const languagePromises = repos.map((repo) =>
      fetchRepoLanguages(repo.languages_url)
    );
    const languagesArray = await Promise.all(languagePromises);

    // Aggregate language bytes from each repository
    languagesArray.forEach((languagesData) => {
      for (const [language, bytes] of Object.entries(languagesData)) {
        // Exclude C#
        if (language === "C#") continue;
        languageTotals[language] = (languageTotals[language] || 0) + bytes;
        totalBytes += bytes;
      }
    });

    // Sort languages by total bytes (descending) and select top 6
    const sortedLanguages = Object.entries(languageTotals)
      .sort(([, aBytes], [, bBytes]) => bBytes - aBytes)
      .slice(0, 6);

    const top6Total = sortedLanguages.reduce(
      (sum, [, bytes]) => sum + bytes,
      0
    );

    // Compute the percentage share for each top language
    const result = {};
    sortedLanguages.forEach(([language, bytes]) => {
      const percentage = ((bytes / top6Total) * 100).toFixed(2);
      result[language] = percentage + "%";
    });

    res.json(result);
  } catch (error) {
    console.error("Error aggregating GitHub language stats:", error.message);
    res.status(500).json({
      error: "Failed to fetch and process GitHub language statistics",
    });
  }
});

module.exports = router;
