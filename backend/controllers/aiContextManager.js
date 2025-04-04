const fs = require("fs");
const path = require("path");
const { getDB } = require("../config/mongodb");
const pdfParse = require("pdf-parse");

// For external API calls
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PER_PAGE = 100;

// Define file paths for contexts
const dbContextFilePath = path.join(__dirname, "../data", "db-context.json");
const githubContextFilePath = path.join(
  __dirname,
  "../data",
  "github-context.json"
);
const resumeContextFilePath = path.join(
  __dirname,
  "../data",
  "resume-context.json"
);
const memoryIndexFilePath = path.join(
  __dirname,
  "../data",
  "memory-index.json"
);

// Path to the resume PDF file
const resumeFilePath = path.join(
  __dirname,
  "../data",
  "Singh_Kartavya_Resume2025.pdf"
);

/**
 * Recursively remove empty properties.
 */
function removeEmptyFields(obj) {
  if (Array.isArray(obj)) {
    const newArr = obj
      .map((item) => removeEmptyFields(item))
      .filter((item) => {
        if (item === null || item === undefined) return false;
        if (typeof item === "string" && item.trim() === "") return false;
        if (Array.isArray(item) && item.length === 0) return false;
        if (
          typeof item === "object" &&
          !Array.isArray(item) &&
          Object.keys(item).length === 0
        )
          return false;
        return true;
      });
    return newArr;
  } else if (typeof obj === "object" && obj !== null) {
    Object.keys(obj).forEach((key) => {
      obj[key] = removeEmptyFields(obj[key]);
      if (
        obj[key] === null ||
        obj[key] === undefined ||
        (typeof obj[key] === "string" && obj[key].trim() === "") ||
        (Array.isArray(obj[key]) && obj[key].length === 0) ||
        (typeof obj[key] === "object" &&
          !Array.isArray(obj[key]) &&
          Object.keys(obj[key]).length === 0)
      ) {
        delete obj[key];
      }
    });
    return obj;
  }
  return obj;
}

/* ============================
   Database Context Functions
   ============================ */
async function aggregateDbContextFromDB() {
  try {
    const db = getDB();
    const experienceData = await db
      .collection("experienceTable")
      .find(
        { deleted: { $ne: true } },
        {
          projection: {
            _id: 0,
            experienceLink: 0,
            experienceURLs: 0,
            likesCount: 0,
            experienceImages: 0,
          },
        }
      )
      .toArray();
    const honorsData = await db
      .collection("honorsExperienceTable")
      .find(
        { deleted: { $ne: true } },
        {
          projection: {
            _id: 0,
            honorsExperienceLink: 0,
            honorsExperienceURLs: 0,
            likesCount: 0,
            honorsExperienceImages: 0,
          },
        }
      )
      .toArray();
    const involvementData = await db
      .collection("involvementTable")
      .find(
        { deleted: { $ne: true } },
        {
          projection: {
            _id: 0,
            involvementLink: 0,
            involvementURLs: 0,
            likesCount: 0,
            involvementImages: 0,
          },
        }
      )
      .toArray();
    const projectData = await db
      .collection("projectTable")
      .find(
        { deleted: { $ne: true } },
        {
          projection: {
            _id: 0,
            projectLink: 0,
            projectURLs: 0,
            likesCount: 0,
            projectImages: 0,
          },
        }
      )
      .toArray();
    const skillsCollectionData = await db
      .collection("skillsCollection")
      .find({}, { projection: { _id: 0 } })
      .toArray();
    const skillsTableData = await db
      .collection("skillsTable")
      .find({}, { projection: { _id: 0 } })
      .toArray();
    const yearData = await db
      .collection("yearInReviewTable")
      .find(
        { deleted: { $ne: true } },
        {
          projection: {
            _id: 0,
            yearInReviewLink: 0,
            yearInReviewURLs: 0,
            likesCount: 0,
            yearInReviewImages: 0,
          },
        }
      )
      .toArray();
    const aggregated = {
      experienceTable: experienceData,
      honorsExperienceTable: honorsData,
      involvementTable: involvementData,
      projectTable: projectData,
      skillsCollection: skillsCollectionData,
      skillsTable: skillsTableData,
      yearInReviewTable: yearData,
    };
    return removeEmptyFields(aggregated);
  } catch (error) {
    console.error("Error aggregating DB context:", error);
    throw error;
  }
}

async function updateDbContextFile() {
  try {
    const dir = path.dirname(dbContextFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const aggregatedData = await aggregateDbContextFromDB();
    const jsonContent = JSON.stringify(aggregatedData, null, 2);
    await fs.promises.writeFile(dbContextFilePath, jsonContent, "utf8");
    console.log(`DB context updated at ${new Date().toISOString()}`);
  } catch (error) {
    console.error("Error updating DB context file:", error);
  }
}

async function getDbContextFile() {
  try {
    if (!fs.existsSync(dbContextFilePath)) {
      console.log("DB context file does not exist. Creating one.");
      await updateDbContextFile();
    }
    const content = await fs.promises.readFile(dbContextFilePath, "utf8");
    if (!content || content.trim().length === 0) {
      console.log("DB context file is empty. Updating file.");
      await updateDbContextFile();
      return fs.promises.readFile(dbContextFilePath, "utf8");
    }
    return content;
  } catch (error) {
    console.error("Error reading DB context file:", error.message);
    throw error;
  }
}

/* ============================
   GitHub Context Functions
   ============================ */
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

async function aggregateGithubContextFromAPI() {
  try {
    const repos = await fetchAllRepos();
    const githubContext = repos.map((repo) => ({
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      html_url: repo.html_url,
      language: repo.language,
      visibility: repo.private ? "private" : "public",
      created_at: repo.created_at,
      updated_at: repo.updated_at,
      pushed_at: repo.pushed_at,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      // If available, add: push_count: repo.pushes_count,
    }));
    return removeEmptyFields(githubContext);
  } catch (error) {
    console.error("Error aggregating GitHub context:", error);
    throw error;
  }
}

async function updateGithubContextFile() {
  try {
    const dir = path.dirname(githubContextFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const aggregatedData = await aggregateGithubContextFromAPI();
    const jsonContent = JSON.stringify(aggregatedData, null, 2);
    await fs.promises.writeFile(githubContextFilePath, jsonContent, "utf8");
    console.log(`GitHub context updated at ${new Date().toISOString()}`);
  } catch (error) {
    console.error("Error updating GitHub context file:", error);
  }
}

async function getGithubContextFile() {
  try {
    if (!fs.existsSync(githubContextFilePath)) {
      console.log("GitHub context file does not exist. Creating one.");
      await updateGithubContextFile();
    }
    const content = await fs.promises.readFile(githubContextFilePath, "utf8");
    if (!content || content.trim().length === 0) {
      console.log("GitHub context file is empty. Updating file.");
      await updateGithubContextFile();
      return fs.promises.readFile(githubContextFilePath, "utf8");
    }
    return content;
  } catch (error) {
    console.error("Error reading GitHub context file:", error.message);
    throw error;
  }
}

/* ============================
   Resume Context Functions
   ============================
*/
async function aggregateResumeContextFromPDF() {
  try {
    if (!fs.existsSync(resumeFilePath)) {
      console.warn("Resume PDF not found.");
      return {};
    }
    const dataBuffer = await fs.promises.readFile(resumeFilePath);
    const pdfData = await pdfParse(dataBuffer);
    // Optionally, further formatting/summarization can be applied here.
    return { resume_text: pdfData.text.trim() };
  } catch (error) {
    console.error("Error aggregating resume context:", error);
    throw error;
  }
}

async function updateResumeContextFile() {
  try {
    const dir = path.dirname(resumeContextFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const aggregatedData = await aggregateResumeContextFromPDF();
    const jsonContent = JSON.stringify(aggregatedData, null, 2);
    await fs.promises.writeFile(resumeContextFilePath, jsonContent, "utf8");
    console.log(`Resume context updated at ${new Date().toISOString()}`);
  } catch (error) {
    console.error("Error updating resume context file:", error);
  }
}

async function getResumeContextFile() {
  try {
    if (!fs.existsSync(resumeContextFilePath)) {
      console.log("Resume context file does not exist. Creating one.");
      await updateResumeContextFile();
    }
    const content = await fs.promises.readFile(resumeContextFilePath, "utf8");
    if (!content || content.trim().length === 0) {
      console.log("Resume context file is empty. Updating file.");
      await updateResumeContextFile();
      return fs.promises.readFile(resumeContextFilePath, "utf8");
    }
    return content;
  } catch (error) {
    console.error("Error reading resume context file:", error.message);
    throw error;
  }
}

/* ============================
   Memory Embedding & Retrieval
   ============================
*/

// Global in-memory vector index
let memoryIndex = [];

/**
 * getEmbedding - Uses OpenAI's embedding API (text-embedding-ada-002) to get an embedding for a text.
 */
async function getEmbedding(text) {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not set");
  }
  const url = "https://api.openai.com/v1/embeddings";
  const body = {
    model: "text-embedding-ada-002",
    input: text,
  };
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Failed to get embedding: ${response.status}`);
  }
  const data = await response.json();
  return data.data[0].embedding;
}

/**
 * splitTextIntoChunks - Splits a long text into chunks based on a maximum length.
 */
function splitTextIntoChunks(text, maxLength = 300) {
  const paragraphs = text.split("\n").filter((p) => p.trim().length > 0);
  const chunks = [];
  let currentChunk = "";
  paragraphs.forEach((paragraph) => {
    if ((currentChunk + paragraph).length > maxLength) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      currentChunk += " " + paragraph;
    }
  });
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

/**
 * buildMemoryIndex - Loads all contexts, splits them into chunks, gets embeddings for each, and saves them in a global index.
 */
async function buildMemoryIndex() {
  memoryIndex = [];
  try {
    const dbContext = JSON.parse(await getDbContextFile());
    const githubContext = JSON.parse(await getGithubContextFile());
    const resumeContext = JSON.parse(await getResumeContextFile());

    // Extract text representations from contexts
    const dbText = JSON.stringify(dbContext);
    const githubText = JSON.stringify(githubContext);
    const resumeText = resumeContext.resume_text || "";

    const dbChunks = splitTextIntoChunks(dbText);
    const githubChunks = splitTextIntoChunks(githubText);
    const resumeChunks = splitTextIntoChunks(resumeText);

    for (const chunk of [...dbChunks, ...githubChunks, ...resumeChunks]) {
      if (chunk.trim().length === 0) continue;
      try {
        const embedding = await getEmbedding(chunk);
        memoryIndex.push({ text: chunk, embedding });
      } catch (embedError) {
        console.error("Error embedding chunk:", embedError);
      }
    }
    console.log(`Memory index built with ${memoryIndex.length} chunks.`);
    // Save memory index to file for inspection
    const memIndexJson = JSON.stringify(memoryIndex, null, 2);
    const memIndexDir = path.dirname(memoryIndexFilePath);
    if (!fs.existsSync(memIndexDir))
      fs.mkdirSync(memIndexDir, { recursive: true });
    await fs.promises.writeFile(memoryIndexFilePath, memIndexJson, "utf8");
    console.log(`Memory index saved to ${memoryIndexFilePath}`);
  } catch (error) {
    console.error("Error building memory index:", error);
  }
}

/**
 * computeCosineSimilarity - Computes cosine similarity between two vectors.
 */
function computeCosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (normA * normB);
}

/**
 * getRelevantContext - Given a query, computes its embedding and returns the topK most similar chunks.
 */
async function getRelevantContext(query, topK = 5) {
  try {
    const queryEmbedding = await getEmbedding(query);
    const similarities = memoryIndex.map((item) => ({
      text: item.text,
      score: computeCosineSimilarity(queryEmbedding, item.embedding),
    }));
    similarities.sort((a, b) => b.score - a.score);
    return similarities.slice(0, topK).map((item) => item.text);
  } catch (error) {
    console.error("Error retrieving relevant context:", error);
    throw error;
  }
}

/* ============================
   LLM Query Function
   ============================
*/
/**
 * askLLM - Given a query, retrieves relevant context chunks, builds a prompt, sends it to OpenAI's completions endpoint,
 * logs the query, and returns the generated answer.
 */
async function askLLM(query) {
  console.log("Received query:", query);
  const relevantChunks = await getRelevantContext(query, 5);
  const contextText = relevantChunks.join("\n\n");
  const prompt = `
Use only the following context to answer the query.

CONTEXT:
${contextText}

QUERY:
${query}
`;
  const url = "https://api.openai.com/v1/completions";
  const body = {
    model: "gpt-4-0-mini", // Adjust the model name as needed.
    prompt,
    max_tokens: 200,
    temperature: 0.7,
  };
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`LLM request failed: ${response.status}`);
  }
  const data = await response.json();
  return data.choices[0].text.trim();
}

/* ======================================
   Daily Update Scheduling
   ====================================== */
function scheduleDailyUpdate(updateFn) {
  const now = new Date();
  const nextUpdate = new Date(now);
  nextUpdate.setUTCHours(5, 0, 0, 0); // 5:00 AM UTC (12:00 AM EST)
  if (nextUpdate <= now) nextUpdate.setUTCDate(nextUpdate.getUTCDate() + 1);
  const delay = nextUpdate.getTime() - now.getTime();
  console.log(`Scheduled update in ${Math.round(delay / 1000)} seconds.`);
  setTimeout(() => {
    updateFn();
    setInterval(updateFn, 24 * 60 * 60 * 1000);
  }, delay);
}

// Schedule daily updates for context files and rebuild the memory index.
scheduleDailyUpdate(updateDbContextFile);
scheduleDailyUpdate(updateGithubContextFile);
scheduleDailyUpdate(updateResumeContextFile);
scheduleDailyUpdate(buildMemoryIndex);
// Build the memory index on startup.
buildMemoryIndex();

module.exports = {
  // DB context functions
  getDbContextFile,
  updateDbContextFile,
  // GitHub context functions
  getGithubContextFile,
  updateGithubContextFile,
  // Resume context functions
  getResumeContextFile,
  updateResumeContextFile,
  // Memory embedding & retrieval functions
  buildMemoryIndex,
  getRelevantContext,
  // LLM query function
  askLLM,
};
