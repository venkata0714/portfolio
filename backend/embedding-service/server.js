// embedding-service/server.js
"use strict";

const express = require("express");
const use = require("@tensorflow-models/universal-sentence-encoder");
const tf = require("@tensorflow/tfjs-node");

const app = express();
app.use(express.json());

let useModel = null;

/**
 * Load the Universal Sentence Encoder model.
 */
async function loadModel() {
  if (!useModel) {
    useModel = await use.load();
    console.log("Universal Sentence Encoder model loaded.");
  }
  return useModel;
}

/**
 * Endpoint to get the embedding of a given text.
 * Expects a JSON payload: { "text": "your text here" }
 */
app.post("/embed", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required." });
    }
    const model = await loadModel();
    const embeddings = await model.embed([text]);
    // Return the first embedding vector.
    return res.json({ embedding: embeddings.arraySync()[0] });
  } catch (error) {
    console.error("Error computing embedding:", error);
    return res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Embedding microservice running on port ${PORT}`);
});
