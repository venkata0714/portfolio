// backend/controllers/projectController.js
const { getDB } = require('../config/mongodb');

// Controller to get all projects
const getProjects = async (req, res) => {
  try {
    const db = getDB();
    const projects = await db.collection('projectTable').find().toArray();
    console.log("Fetched all projects from MongoDB:", projects);
    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Error fetching projects" });
  }
};

// Controller to get a specific project by projectLink
const getProjectByLink = async (req, res) => {
  try {
    const db = getDB();
    const projectLink = req.params.projectLink;
    const project = await db.collection('projectTable').findOne({ projectLink });

    if (project) {
      console.log("Fetched project from MongoDB:", project);
      res.json(project);
    } else {
      res.status(404).json({ message: "Project not found" });
    }
  } catch (error) {
    console.error("Error fetching project by link:", error);
    res.status(500).json({ message: "Error fetching project" });
  }
};

module.exports = { getProjects, getProjectByLink };
