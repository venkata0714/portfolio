const { getDB } = require('../config/mongodb');

const getProjects = async (req, res) => {
  try {
    const db = getDB();
    const projects = await db.collection('projectTable').find().toArray(); // Fetch all documents
    console.log("Fetched projects from MongoDB:", projects); // Log data to console
    res.json(projects); // Send data as JSON response
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Error fetching projects" });
  }
};

module.exports = { getProjects };
