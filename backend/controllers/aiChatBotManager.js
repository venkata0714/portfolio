const fs = require("fs");
const path = require("path");
const { Client } = require("@opensearch-project/opensearch");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

// Initialize OpenSearch client (use OPENSEARCH_URL, or default to localhost)
const opensearchClient = new Client({
  node: process.env.OPENSEARCH_URL || "http://localhost:9200",
  auth: {
    username: process.env.OPENSEARCH_USER || "admin",
    password: process.env.OPENSEARCH_INITIAL_ADMIN_PASSWORD || "admin",
  },
  ssl: { rejectUnauthorized: false },
});

// Initialize OpenAI client
// const openaiClient = new OpenAIApi(
//   new Configuration({ apiKey: process.env.OPENAI_API_KEY })
// );

// File paths for context data and cache
const DB_FILE = path.join(__dirname, "../data/db-context.json");
const GITHUB_FILE = path.join(__dirname, "../data/github-context.json");
const RESUME_FILE = path.join(__dirname, "../data/resume-context.json");
const CACHE_FILE = path.join(__dirname, "../data/cache.json");
const INDEX_NAME = "context-index";

/**
 * Load JSON data files and break them into searchable chunks.
 * - Each database table entry is a chunk.
 * - Each GitHub repo is a chunk.
 * - Resume text is split by all-caps headings into sections.
 */
async function loadAndChunkData() {
  console.log(
    `[${new Date().toISOString()}] Loading and chunking context data...`
  );
  const dbData = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  const githubData = JSON.parse(fs.readFileSync(GITHUB_FILE, "utf8"));
  const resumeData = JSON.parse(fs.readFileSync(RESUME_FILE, "utf8"));

  const chunks = [];

  // 1. Chunk database tables: one chunk per entry
  Object.entries(dbData).forEach(([tableName, entries]) => {
    if (!Array.isArray(entries)) return;
    entries.forEach((entry) => {
      // Title field (e.g. "experienceTitle", "projectTitle", etc.)
      let titleKey = Object.keys(entry).find((k) =>
        k.toLowerCase().includes("title")
      );
      let title = titleKey ? entry[titleKey] : "";

      // Content: combine tagline and paragraphs if present
      let contentParts = [];
      let taglineKey = Object.keys(entry).find((k) =>
        k.toLowerCase().includes("tagline")
      );
      let paragraphsKey = Object.keys(entry).find((k) =>
        k.toLowerCase().includes("paragraphs")
      );
      if (taglineKey && entry[taglineKey]) {
        contentParts.push(entry[taglineKey]);
      }
      if (paragraphsKey && Array.isArray(entry[paragraphsKey])) {
        contentParts.push(...entry[paragraphsKey]);
      }
      // If still empty, check for generic description fields
      if (contentParts.length === 0) {
        if (entry.description) contentParts.push(entry.description);
        if (entry.skillDescription) contentParts.push(entry.skillDescription);
      }
      const content = contentParts.join(" ");
      chunks.push({
        source: "db",
        section: tableName,
        title: title,
        content: content,
      });
    });
  });

  // 2. Chunk GitHub data: each repository is a chunk
  if (Array.isArray(githubData)) {
    githubData.forEach((repo) => {
      const title = repo.name || repo.full_name || "";
      let contentParts = [];
      if (repo.description) contentParts.push(repo.description);
      if (repo.language) contentParts.push(`Language: ${repo.language}`);
      const content = contentParts.join(" | ");
      chunks.push({
        source: "github",
        title: title,
        content: content,
      });
    });
  }

  // 3. Chunk resume data by all-caps headings
  if (resumeData.resume_text) {
    const lines = resumeData.resume_text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l);
    let currentSection = "General";
    let sectionContent = { General: [] };
    lines.forEach((line) => {
      // Detect section headers as lines in all caps (letters, numbers, spaces, hyphens)
      if (/^[A-Z][A-Z0-9 &\-]+$/.test(line)) {
        currentSection = line;
        sectionContent[currentSection] = [];
      } else {
        sectionContent[currentSection].push(line);
      }
    });
    Object.entries(sectionContent).forEach(([section, lines]) => {
      if (lines.length > 0) {
        chunks.push({
          source: "resume",
          section: section,
          title: section,
          content: lines.join(" "),
        });
      }
    });
  }

  console.log(
    `[${new Date().toISOString()}] Created ${chunks.length} chunks from data.`
  );
  return chunks;
}

/**
 * Index all chunks into OpenSearch using a bulk operation.
 * This recreates the "context-index" on each run for fresh data.
 */
async function indexChunks(chunks) {
  console.log(
    `[${new Date().toISOString()}] Indexing chunks into OpenSearch...`
  );

  // Delete existing index if it exists
  try {
    const exists = await opensearchClient.indices.exists({ index: INDEX_NAME });
    if (exists.body) {
      await opensearchClient.indices.delete({ index: INDEX_NAME });
      console.log(
        `[${new Date().toISOString()}] Deleted old index '${INDEX_NAME}'.`
      );
    }
  } catch (err) {
    console.error("Error checking/deleting index:", err);
  }
  // Create new index with field mappings
  try {
    await opensearchClient.indices.create({
      index: INDEX_NAME,
      body: {
        mappings: {
          properties: {
            source: { type: "keyword" },
            section: { type: "keyword" },
            title: { type: "text" },
            content: { type: "text" },
          },
        },
      },
    });
    console.log(`[${new Date().toISOString()}] Created index '${INDEX_NAME}'.`);
  } catch (err) {
    console.error("Error creating index:", err);
    return;
  }
  // Bulk index all documents
  const body = [];
  chunks.forEach((chunk, idx) => {
    body.push({ index: { _index: INDEX_NAME, _id: idx + 1 } });
    body.push(chunk);
  });
  try {
    const bulkResponse = await opensearchClient.bulk({ refresh: true, body });
    if (bulkResponse.body.errors) {
      console.error("Bulk indexing errors:", bulkResponse.body);
    } else {
      console.log(
        `[${new Date().toISOString()}] Successfully indexed ${
          chunks.length
        } chunks.`
      );
    }
  } catch (err) {
    console.error("Error during bulk indexing:", err);
  }
}

/**
 * Search the OpenSearch index for the top 5 relevant chunks for the given query.
 * Uses a full-text multi-match on title (boosted) and content.
 */
async function searchChunks(query) {
  console.log(`[${new Date().toISOString()}] Searching for query: "${query}"`);
  try {
    const result = await opensearchClient.search({
      index: INDEX_NAME,
      size: 5,
      body: {
        query: {
          multi_match: {
            query: query,
            fields: ["title^2", "content"],
          },
        },
      },
    });
    const hits = result.body.hits.hits;
    console.log(
      `[${new Date().toISOString()}] Retrieved ${hits.length} relevant chunks.`
    );
    return hits.map((hit) => hit._source);
  } catch (err) {
    console.error("Search error:", err);
    return [];
  }
}

/**
 * Build a custom prompt for OpenAI using the retrieved chunks and the original user query.
 * Each chunk is labeled by its source (DB, GitHub, Resume) and included in the prompt context.
 */
function buildPrompt(chunks, userQuery) {
  console.log(`[${new Date().toISOString()}] Building prompt from chunks...`);
  let prompt = "Use the following information to answer the question:\n\n";
  chunks.forEach((chunk) => {
    if (chunk.source === "db") {
      prompt += `- [DB] ${chunk.title}: ${chunk.content}\n`;
    } else if (chunk.source === "github") {
      prompt += `- [GitHub] ${chunk.title}: ${chunk.content}\n`;
    } else if (chunk.source === "resume") {
      prompt += `- [Resume - ${chunk.section}] ${chunk.content}\n`;
    }
  });
  prompt += `\nQuestion: ${userQuery}\nAnswer:`;
  return prompt;
}

/**
 * Load the response cache (if it exists) or return a new empty object.
 */
function loadCache() {
  if (fs.existsSync(CACHE_FILE)) {
    try {
      const data = fs.readFileSync(CACHE_FILE, "utf8");
      return JSON.parse(data || "{}");
    } catch (err) {
      console.error("Error reading cache file:", err);
    }
  }
  return {};
}

/**
 * Save the cache object to the JSON file.
 */
function saveCache(cache) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (err) {
    console.error("Error writing cache file:", err);
  }
}

/**
 * Query OpenAI (GPT-4o) with the prompt and return the answer.
 * Uses a local JSON cache to skip API calls for repeated prompts.
 */
async function queryOpenAI(prompt) {
  const cache = loadCache();
  if (cache[prompt]) {
    console.log(`[${new Date().toISOString()}] Cache hit for prompt.`);
    return cache[prompt];
  }
  console.log(
    `[${new Date().toISOString()}] Cache miss; sending prompt to OpenAI.`
  );
  const response = await openaiClient.createChatCompletion({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: prompt },
    ],
    max_tokens: 500,
    temperature: 0.7,
  });
  const answer = response.data.choices[0].message.content.trim();
  cache[prompt] = answer;
  saveCache(cache);
  return answer;
}

/**
 * Main interface: given a user query, search context, build prompt, and get an answer.
 */
async function getAnswer(userQuery) {
  const relevantChunks = await searchChunks(userQuery);
  console.log(
    `[${new Date().toISOString()}] Relevant chunks:\n${JSON.stringify(
      relevantChunks,
      null,
      2
    )}\n`
  );
  const prompt = buildPrompt(relevantChunks, userQuery);
  console.log(`[${new Date().toISOString()}] Final prompt:\n${prompt}\n`);
  const answer = await queryOpenAI(prompt);
  return answer;
}

/**
 * Re-index all data: load, chunk, and index. This function is run on startup and every hour.
 */
async function reindexAll() {
  try {
    const chunks = await loadAndChunkData();
    await indexChunks(chunks);
  } catch (err) {
    console.error("Error during reindexAll:", err);
  }
}

// Perform initial indexing at startup
reindexAll();
// Schedule re-indexing every hour (3600000 ms)
setInterval(reindexAll, 3600000);

// Export functions for external use if needed
module.exports = { getAnswer, reindexAll };
