// controllers/aiContextManager.js
const fs = require("fs");
const path = require("path");
const { getDB, getDBAI } = require("../config/mongodb");
const pdfParse = require("pdf-parse");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const openai = require("../config/openai");
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Vector Search index name and definition
const SEARCH_INDEX_NAME = "chunkEmbeddingsIndex";
const SEARCH_INDEX_DEF = {
  mappings: {
    dynamic: false,
    fields: {
      category: { type: "string" },
      embedding: {
        type: "knnVector",
        dimensions: 1536,
        similarity: "cosine",
      },
      text: { type: "string" },
    },
  },
};

// Path to your resume PDF in data/
const resumeFilePath = path.join(
  __dirname,
  "../data/Singh_Kartavya_Resume2025.pdf"
);

// In-memory caches
let memoryIndex = [];
let contextMeta = {};
let memoryIndexMeta = {};

/**
 * Recursively remove empty or null fields from objects/arrays.
 */
function removeEmptyFields(obj) {
  if (Array.isArray(obj)) {
    return obj
      .map(removeEmptyFields)
      .filter(
        (x) =>
          x != null &&
          !(typeof x === "string" && x.trim() === "") &&
          !(Array.isArray(x) && x.length === 0) &&
          !(
            typeof x === "object" &&
            !Array.isArray(x) &&
            !Object.keys(x).length
          )
      );
  } else if (obj && typeof obj === "object") {
    for (const k of Object.keys(obj)) {
      obj[k] = removeEmptyFields(obj[k]);
      if (
        obj[k] == null ||
        (typeof obj[k] === "string" && obj[k].trim() === "") ||
        (Array.isArray(obj[k]) && obj[k].length === 0) ||
        (typeof obj[k] === "object" &&
          !Array.isArray(obj[k]) &&
          !Object.keys(obj[k]).length)
      ) {
        delete obj[k];
      }
    }
    return obj;
  }
  return obj;
}

/*===============================================
  Context Meta (single‐doc in collection "contextMeta")
===============================================*/
async function loadContextMeta() {
  const db = getDBAI();
  const doc = await db
    .collection("contextMeta")
    .findOne({ _id: "contextMeta" });
  contextMeta = doc || {};
}

async function saveContextMeta() {
  const db = getDBAI();
  await db
    .collection("contextMeta")
    .updateOne(
      { _id: "contextMeta" },
      { $set: { ...contextMeta, _id: "contextMeta" } },
      { upsert: true }
    );
}

/*===============================================
  DB Context Snapshots ("dbContexts")
===============================================*/
async function aggregateDbContext() {
  const db = getDB();
  // Fetch data from each collection, excluding unwanted fields
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
}
async function updateDbContextFile() {
  const db = getDBAI();
  const snapshot = await aggregateDbContext();
  await db.collection("dbContexts").insertOne({
    data: snapshot,
    createdAt: new Date(),
  });
  contextMeta.dbContextLastUpdate = new Date().toISOString();
  await saveContextMeta();
  console.log(
    `✅ dbContexts snapshot saved (${Object.keys(snapshot).length} tables)`
  );
}

async function getDbContextFile() {
  const db = getDBAI();
  const doc = await db
    .collection("dbContexts")
    .find()
    .sort({ createdAt: -1 })
    .limit(1)
    .next();
  if (!doc) {
    await updateDbContextFile();
    return JSON.stringify(await aggregateDbContext());
  }
  return JSON.stringify(doc.data);
}

/*===============================================
  GitHub Context Snapshots ("githubContexts")
===============================================*/
async function fetchAllRepos() {
  if (!GITHUB_TOKEN) throw new Error("GITHUB_TOKEN not set");
  let repos = [],
    page = 1;
  while (1) {
    const res = await fetch(
      `https://api.github.com/user/repos?per_page=100&page=${page}`,
      { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
    );
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const arr = await res.json();
    if (!arr.length) break;
    repos = repos.concat(arr);
    page++;
  }
  return repos;
}

async function fetchRepoReadme(fullName) {
  const res = await fetch(`https://api.github.com/repos/${fullName}/readme`, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3.raw",
    },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub README ${res.status}`);
  return (await res.text()).trim();
}

async function aggregateGithubContext() {
  const repos = await fetchAllRepos();
  const out = [];
  for (const r of repos) {
    const info = {
      name: r.name,
      full_name: r.full_name,
      description: r.description || "",
      html_url: r.html_url,
      language: r.language || "",
      visibility: r.private ? "private" : "public",
      created_at: r.created_at,
      updated_at: r.updated_at,
      pushed_at: r.pushed_at,
      stargazers_count: r.stargazers_count,
      forks_count: r.forks_count,
    };
    try {
      const md = await fetchRepoReadme(r.full_name);
      if (md) info.readme = md;
    } catch (e) {
      console.error(`README error ${r.full_name}:`, e.message);
    }
    out.push(removeEmptyFields(info));
  }
  return out;
}

async function updateGithubContextFile() {
  const db = getDBAI();
  const snapshot = await aggregateGithubContext();
  await db.collection("githubContexts").insertOne({
    data: snapshot,
    createdAt: new Date(),
  });
  contextMeta.githubContextLastUpdate = new Date().toISOString();
  await saveContextMeta();
  console.log(`✅ githubContexts snapshot saved (${snapshot.length} repos)`);
}

async function getGithubContextFile() {
  const db = getDBAI();
  const doc = await db
    .collection("githubContexts")
    .find()
    .sort({ createdAt: -1 })
    .limit(1)
    .next();
  if (!doc) {
    await updateGithubContextFile();
    return JSON.stringify(await aggregateGithubContext());
  }
  return JSON.stringify(doc.data);
}

/*===============================================
  Resume Context Snapshots ("resumeContexts")
===============================================*/
async function aggregateResumeContext() {
  if (!fs.existsSync(resumeFilePath)) return { resume_text: "" };
  const pdf = await pdfParse(await fs.promises.readFile(resumeFilePath));
  return { resume_text: pdf.text.trim() };
}

async function updateResumeContextFile() {
  const db = getDBAI();
  const snapshot = await aggregateResumeContext();
  await db.collection("resumeContexts").insertOne({
    data: snapshot,
    createdAt: new Date(),
  });
  contextMeta.resumeContextLastUpdate = new Date().toISOString();
  await saveContextMeta();
  console.log(
    `✅ resumeContexts snapshot saved (${snapshot.resume_text.length} chars)`
  );
}

async function getResumeContextFile() {
  const db = getDBAI();
  const doc = await db
    .collection("resumeContexts")
    .find()
    .sort({ createdAt: -1 })
    .limit(1)
    .next();
  if (!doc) {
    await updateResumeContextFile();
    return JSON.stringify(await aggregateResumeContext());
  }
  return JSON.stringify(doc.data);
}

/*===============================================
  Chunking Functions (unchanged implementation)
===============================================*/
function chunkDbItem(tableName, item) {
  const chunks = [];
  let summaryLines = [];
  let longTextFields = {};

  let itemLabel = "";
  for (const key of Object.keys(item)) {
    if (/title|name/i.test(key) && typeof item[key] === "string") {
      itemLabel = item[key];
      break;
    }
  }

  for (const [key, value] of Object.entries(item)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      if (!value.length) continue;
      if (typeof value[0] === "string") {
        if (value.length > 1 || value[0].length > 200) {
          longTextFields[key] = value;
        } else {
          summaryLines.push(`${key}: ${value[0]}`);
        }
      } else {
        summaryLines.push(`${key}: ${JSON.stringify(value)}`);
      }
    } else if (typeof value === "string") {
      if (value.length > 200 || value.includes("\n")) {
        longTextFields[key] = value;
      } else {
        summaryLines.push(`${key}: ${value}`);
      }
    } else {
      summaryLines.push(`${key}: ${value}`);
    }
  }

  if (summaryLines.length) {
    chunks.push(`${tableName} - ${itemLabel}\n${summaryLines.join("\n")}`);
  }

  for (const [fieldKey, value] of Object.entries(longTextFields)) {
    if (Array.isArray(value)) {
      const paragraphs = value.map((p) => p.trim()).filter(Boolean);
      let subchunks = [];
      if (paragraphs.length <= 3) {
        subchunks = paragraphs;
      } else {
        const groupSize = Math.ceil(paragraphs.length / 3);
        for (let i = 0; i < paragraphs.length; i += groupSize) {
          subchunks.push(paragraphs.slice(i, i + groupSize).join(" "));
        }
      }
      for (const sub of subchunks) {
        if (sub) chunks.push(`${tableName} - ${itemLabel}: ${sub}`);
      }
    } else {
      const text = value.trim();
      if (text.length <= 400) {
        chunks.push(`${tableName} - ${itemLabel}: ${text}`);
      } else {
        const sentences = text.split(/(?<=[.?!])\s+(?=[A-Z])/);
        let part = "";
        const subchunks = [];
        for (const sent of sentences) {
          if ((part + sent).length > 400) {
            if (part) subchunks.push(part.trim());
            part = sent;
          } else {
            part += (part ? " " : "") + sent;
          }
        }
        if (part) subchunks.push(part.trim());
        if (subchunks.length > 3) {
          const merged = [];
          const gs = Math.ceil(subchunks.length / 3);
          for (let i = 0; i < subchunks.length; i += gs) {
            merged.push(subchunks.slice(i, i + gs).join(" "));
          }
          subchunks.splice(0, subchunks.length, ...merged);
        }
        for (const sub of subchunks) {
          if (sub) chunks.push(`${tableName} - ${itemLabel}: ${sub}`);
        }
      }
    }
  }

  return chunks;
}

function chunkDbContext(dbContextObj) {
  return Object.entries(dbContextObj)
    .flatMap(([tableName, items]) =>
      Array.isArray(items)
        ? items.flatMap((it) => chunkDbItem(tableName, it))
        : []
    )
    .map((text) => ({ category: "db", text }));
}

function chunkGithubContext(repoArray) {
  const chunks = [];
  for (const repo of repoArray) {
    const name = repo.name || repo.full_name || "Repository";
    let baseText = `Repository: ${name}`;
    if (repo.description) baseText += `\nDescription: ${repo.description}`;
    if (repo.language) baseText += `\nLanguage: ${repo.language}`;
    const readme = repo.readme || "";
    if (!readme) {
      chunks.push({ category: "github", text: baseText });
    } else {
      const paras = readme
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
      let current = "",
        first = true;
      for (const p of paras) {
        const withNewline = p + "\n";
        if ((current + withNewline).length > 1000) {
          const label = first ? "README:" : "README (contd):";
          chunks.push({
            category: "github",
            text: `${baseText}\n${label}\n${current.trim()}`,
          });
          first = false;
          current = withNewline;
        } else {
          current += withNewline;
        }
      }
      if (current.trim()) {
        const label = first ? "README:" : "README (contd):";
        chunks.push({
          category: "github",
          text: `${baseText}\n${label}\n${current.trim()}`,
        });
      }
    }
  }
  return chunks;
}

function chunkResumeContext(resumeText) {
  const chunks = [];
  if (!resumeText.trim()) return chunks;

  const lines = resumeText.split("\n");
  const headingIndices = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (
      line &&
      line === line.toUpperCase() &&
      /^[A-Z\s&]+$/.test(line) &&
      line.length < 60 &&
      !(i < 5 && /\d/.test(lines[i + 1] || ""))
    ) {
      headingIndices.push(i);
    }
  }
  if (!headingIndices.length) {
    chunks.push({ category: "resume", text: resumeText.trim() });
    return chunks;
  }

  const firstHeadingIdx = headingIndices[0];
  const sections = headingIndices.map((start, idx) => {
    const end =
      idx < headingIndices.length - 1 ? headingIndices[idx + 1] : lines.length;
    return {
      heading: lines[start].trim(),
      content: lines.slice(start + 1, end),
    };
  });

  for (const { heading, content } of sections) {
    const merged = [];
    for (let i = 0; i < content.length; i++) {
      let line = content[i];
      if (!line.trim()) {
        merged.push("");
      } else if (line.trim().endsWith(":")) {
        let agg = line.trim();
        while (
          i + 1 < content.length &&
          content[i + 1].trim() &&
          !content[i + 1].trim().endsWith(":") &&
          !content[i + 1].trim().startsWith("•")
        ) {
          agg += " " + content[++i].trim();
        }
        merged.push(agg);
      } else if (line.trim().startsWith("•")) {
        merged.push(line.trim());
      } else {
        if (
          merged.length &&
          merged[merged.length - 1] &&
          !merged[merged.length - 1].startsWith("•") &&
          !merged[merged.length - 1].endsWith(":")
        ) {
          merged[merged.length - 1] += " " + line.trim();
        } else {
          merged.push(line.trim());
        }
      }
    }

    let i = 0;
    while (i < merged.length) {
      if (!merged[i]) {
        i++;
        continue;
      }
      if (!merged[i].startsWith("•")) {
        const entryLines = [merged[i++]];
        while (i < merged.length && merged[i] && !merged[i].startsWith("•")) {
          break;
        }
        const bullets = [];
        while (i < merged.length && merged[i].startsWith("•")) {
          let b = merged[i++];
          while (i < merged.length && merged[i] && !merged[i].startsWith("•")) {
            b += " " + merged[i++];
          }
          bullets.push(b);
        }
        let text = `${heading}\n${entryLines.join("\n")}`;
        if (bullets.length) text += "\n" + bullets.join("\n");
        chunks.push({ category: "resume", text: text.trim() });
      } else {
        const b = merged[i++];
        chunks.push({ category: "resume", text: `${heading}\n${b}` });
      }
    }
  }

  return chunks;
}

/*===============================================
  Load & Persist Chunks ("chunkContents")
===============================================*/
async function loadAndChunkData() {
  const dbData = JSON.parse(await getDbContextFile());
  const ghData = JSON.parse(await getGithubContextFile());
  const resData = JSON.parse(await getResumeContextFile());
  let chunksDbContext = chunkDbContext(dbData);
  let chunksGithubContext = chunkGithubContext(ghData);
  let chunksResumeContext = chunkResumeContext(resData.resume_text || "");

  const allChunks = [
    ...chunksDbContext,
    ...chunksGithubContext,
    ...chunksResumeContext,
  ];

  const db = getDBAI();
  await db.collection("chunkContents").deleteMany({});
  if (allChunks.length) {
    const now = new Date();
    await db.collection("chunkContents").insertMany(
      allChunks.map((c) => ({
        category: c.category,
        text: c.text,
        createdAt: now,
      }))
    );
  }
  console.log(`✅ Stored ${chunksDbContext.length} chunks in dbContexts`);
  console.log(
    `✅ Stored ${chunksGithubContext.length} chunks in githubContexts`
  );
  console.log(
    `✅ Stored ${chunksResumeContext.length} chunks in resumeContexts`
  );
  console.log(`✅ Stored ${allChunks.length} chunks in chunkContents`);
  return allChunks;
}

/*===============================================
  Embedding & Memory Index ("memoryIndex", "memoryIndexMeta")
===============================================*/
async function loadMemoryIndexMeta() {
  const db = getDBAI();
  const doc = await db
    .collection("memoryIndexMeta")
    .findOne({ _id: "memoryIndexMeta" });
  memoryIndexMeta = doc || {};
}

async function getEmbedding(text) {
  if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not set");
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return res.data[0].embedding;
}

function computeCosineSimilarity(a, b) {
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

/**
 * Ensure MongoDB Atlas Search index exists with correct mappings.
 */
async function ensureSearchIndex() {
  const db = getDBAI();
  // 1) List existing search indexes on memoryIndex
  const { indexes } = await db.command({ listSearchIndexes: "memoryIndex" });
  const existing = indexes.find((i) => i.name === SEARCH_INDEX_NAME);

  // 2) If exists but mappings differ, drop it
  if (existing) {
    const same =
      JSON.stringify(existing.definition) === JSON.stringify(SEARCH_INDEX_DEF);
    if (!same) {
      console.log(`🔄 Updating index ${SEARCH_INDEX_NAME} mappings`);
      await db.command({
        dropSearchIndex: { collection: "memoryIndex", name: SEARCH_INDEX_NAME },
      });
    } else if (
      (await db.collection("memoryIndex").countDocuments()) ===
      memoryIndex.length
    ) {
      console.log(`✅ ${SEARCH_INDEX_NAME} is up to date`);
      return;
    }
  }

  // 3) Create or recreate the index
  console.log(`🛠 Creating index ${SEARCH_INDEX_NAME}`);
  await db.command({
    createSearchIndexes: {
      collection: "memoryIndex",
      indexes: [{ name: SEARCH_INDEX_NAME, definition: SEARCH_INDEX_DEF }],
    },
  });
  console.log(`✅ ${SEARCH_INDEX_NAME} created, reindexing...`);
}

async function buildMemoryIndex(forceRebuild = false) {
  const db = getDBAI();
  const now = new Date();
  const currentMonth = now.getFullYear() * 12 + now.getMonth();
  let lastUpdateMonth = -1;
  if (memoryIndexMeta.lastUpdate) {
    const d = new Date(memoryIndexMeta.lastUpdate);
    lastUpdateMonth = d.getFullYear() * 12 + d.getMonth();
  }

  const existingCount = await db.collection("memoryIndex").countDocuments();
  if (!forceRebuild && lastUpdateMonth === currentMonth && existingCount > 0) {
    memoryIndex = await db.collection("memoryIndex").find().toArray();
    console.log(
      `Memory index up‑to‑date (${memoryIndex.length} items), skipping rebuild.`
    );
    return;
  }

  console.log("🔄 Rebuilding memory index…");
  const chunks = await loadAndChunkData();
  const out = [];
  for (const { category, text } of chunks) {
    if (!text.trim()) continue;
    try {
      const embedding = await getEmbedding(text);
      out.push({
        category,
        text,
        embedding,
        createdAt: now,
      });
    } catch (e) {
      console.error("Embed error:", e.message);
    }
  }

  await db.collection("memoryIndex").deleteMany({});
  if (out.length) await db.collection("memoryIndex").insertMany(out);
  memoryIndex = out;

  memoryIndexMeta.lastUpdate = now.toISOString();
  await db
    .collection("memoryIndexMeta")
    .updateOne(
      { _id: "memoryIndexMeta" },
      { $set: { lastUpdate: memoryIndexMeta.lastUpdate } },
      { upsert: true }
    );

  console.log(`✅ Memory index rebuilt (${out.length} items)`);
}

/**
 * Use Atlas Vector Search to retrieve top-K per category.
 */
async function semanticSearchWithAtlas(
  queryEmbedding,
  topK = { db: 10, github: 5, resume: 3 }
) {
  const db = getDBAI();
  const pipelines = Object.entries(topK).map(async ([cat, k]) => {
    const hits = await db
      .collection("memoryIndex")
      .aggregate([
        {
          $vectorSearch: {
            index: SEARCH_INDEX_NAME,
            queryVector: queryEmbedding,
            path: "embedding",
            filter: { term: { category: cat } },
            k,
          },
        },
        {
          $project: {
            _id: 0,
            text: 1,
            score: { $meta: "vectorSearchScore" },
            category: "$" + cat,
          },
        },
      ])
      .toArray();
    return hits.map((h) => ({ ...h, category: cat }));
  });
  const resultsArr = await Promise.all(pipelines);
  return resultsArr.flat();
}

/**
 * RAG-style prompt: retrieve via Atlas and generate answer.
 */
async function askWithRAG(query) {
  if (!query.trim()) throw new Error("Query cannot be empty");

  // 1) Ensure memoryIndex loaded
  if (!memoryIndex.length) await buildMemoryIndex(false);

  // 2) Create embedding for query
  const qemb = await getEmbedding(query);

  // 3) Retrieve top hits
  const hits = await semanticSearchWithAtlas(qemb);

  // 4) Sort by score and pick top overall (e.g. 15)
  const top = hits.sort((a, b) => b.score - a.score).slice(0, 15);

  // 5) Build numbered context
  const ctx = top
    .map(
      (c, i) => `[${i + 1}] (${c.category}) ${c.text.replace(/\n+/g, " ")}
`
    )
    .join("\n");

  // 6) Call LLM with citations
  const messages = [
    {
      role: "system",
      content:
        "You are a precise assistant. Use ONLY the context below, cite by [n].",
    },
    { role: "user", content: `CONTEXT:\n${ctx}\nQUESTION: ${query}` },
  ];

  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0,
    max_tokens: 300,
  });

  return resp.choices[0].message.content;
}

async function askLLM(query, conversationMemory = "") {
  if (!query.trim()) throw new Error("Query cannot be empty");

  // Ensure memory index is loaded (for context retrieval)
  if (!memoryIndex.length) {
    const db = getDBAI();
    const cnt = await db.collection("memoryIndex").countDocuments();
    if (cnt) {
      memoryIndex = await db.collection("memoryIndex").find().toArray();
    } else {
      await buildMemoryIndex(true);
    }
  }

  // Embed the user query and compute similarity against stored context chunks
  const qemb = await getEmbedding(query);
  const buckets = { db: [], github: [], resume: [] };
  for (const item of memoryIndex) {
    const score = computeCosineSimilarity(qemb, item.embedding);
    buckets[item.category].push({ text: item.text, score });
  }
  for (const k of Object.keys(buckets)) {
    buckets[k].sort((a, b) => b.score - a.score);
  }
  // Select top relevant chunks from each category (e.g., top 5 DB, 2 GitHub, 3 Resume)
  const selected = [
    ...buckets.db.slice(0, 5),
    ...buckets.github.slice(0, 2),
    ...buckets.resume.slice(0, 3),
  ].sort((a, b) => b.score - a.score);

  console.log(
    `Selected ${selected.length} context chunks for query "${query}"`
  );
  // Concatenate selected context texts (up to MAX_CHARS limit)
  let ctx = "";
  const MAX_CHARS = 8000;
  for (const { text } of selected) {
    const addition = (ctx ? "\n\n" : "") + text;
    if (ctx.length + addition.length > MAX_CHARS) break;
    ctx += addition;
  }

  // Build the prompt with conversation memory if available
  let userPrompt;
  if (conversationMemory && conversationMemory.trim().length > 0) {
    userPrompt = `MEMORY:\n${conversationMemory}\nCONTEXT:\n${ctx}\n\nQUESTION: ${query}`;
  } else {
    userPrompt = `CONTEXT:\n${ctx}\n\nQUESTION: ${query}`;
  }

  // Call OpenAI chat completion API
  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-nano", // same model used throughout
    messages: [
      {
        role: "system",
        content:
          "You are a precise assistant. Answer the question using ONLY the provided context.",
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    max_tokens: 256,
    temperature: 0.3,
  });
  return completion.choices[0].message.content;
}

// New helper: generate follow-up questions
async function suggestFollowUpQuestions(query, answer) {
  // Formulate a prompt for follow-up question generation
  const messages = [
    {
      role: "system",
      content:
        "You are an assistant that suggests follow-up questions to continue the conversation.",
    },
    {
      role: "user",
      content: `The user asked: "${query}"\nYou answered: "${answer}".\nNow suggest 3 brief intelligent follow-up questions the user might ask next.`,
    },
  ];
  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-nano",
    messages,
    max_tokens: 60,
    temperature: 0.6,
  });
  const rawOutput = completion.choices[0].message.content;
  // Split the output into individual questions (assuming separated by newlines or bullet points)
  const suggestions = rawOutput
    .split(/\r?\n/)
    .map((s) => s.replace(/^[\-\d\.\)\s]+/, "").trim()) // remove any list numbering or dashes
    .filter((s) => s); // remove empty lines
  // If the model returned more than 3 lines, take the first 3
  return suggestions.slice(0, 3);
}

// New helper: update conversation memory summary
async function snapshotMemoryUpdate(previousMemory, query, answer) {
  const messages = [
    {
      role: "system",
      content:
        "You are a helpful assistant that maintains a brief memory of the conversation.",
    },
    {
      role: "user",
      content: `Previous memory: ${
        previousMemory || "(none)"
      }\nUser just asked: "${query}"\nAssistant answered: "${answer}"\nUpdate the conversation memory to include this exchange, in 2-3 sentences.`,
    },
  ];
  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-nano",
    messages,
    max_tokens: 150,
    temperature: 0.2,
  });
  return completion.choices[0].message.content.trim();
}

/*===============================================
  Initialization & Scheduling
===============================================*/
async function initContext() {
  await loadContextMeta();
  await loadMemoryIndexMeta();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (
    !contextMeta.dbContextLastUpdate ||
    new Date(contextMeta.dbContextLastUpdate) < today
  )
    await updateDbContextFile();
  if (
    !contextMeta.githubContextLastUpdate ||
    new Date(contextMeta.githubContextLastUpdate) < today
  )
    await updateGithubContextFile();
  if (
    !contextMeta.resumeContextLastUpdate ||
    new Date(contextMeta.resumeContextLastUpdate) < today
  )
    await updateResumeContextFile();

  await buildMemoryIndex(false);

  function scheduleDaily(fn, name, hourUTC = 5) {
    const now = new Date();
    const next = new Date(now);
    next.setUTCHours(hourUTC, 0, 0, 0);
    if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
    const delay = next - now;
    console.log(`⏱ Scheduled ${name} in ${Math.round(delay / 1000)}s`);
    setTimeout(() => {
      fn().catch(console.error);
      setInterval(() => fn().catch(console.error), 24 * 3600 * 1000);
    }, delay);
  }

  scheduleDaily(
    () =>
      Promise.all([
        updateDbContextFile(),
        updateGithubContextFile(),
        updateResumeContextFile(),
      ]),
    "daily context update"
  );
  scheduleDaily(
    () => buildMemoryIndex(false),
    "daily memoryIndex rebuild",
    5.083
  );
}

module.exports = {
  initContext,
  updateDbContextFile,
  updateGithubContextFile,
  updateResumeContextFile,
  buildMemoryIndex,
  askLLM,
  askWithRAG,
  suggestFollowUpQuestions,
  snapshotMemoryUpdate,
};
