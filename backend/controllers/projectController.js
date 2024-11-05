// backend/controllers/projectController.js
const Project = require('../models/Project');

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    console.log(projects); // Log the data to the console as requested
    res.json(projects); // Send the data back as a JSON response
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Error fetching projects" });
  }
};

module.exports = { getProjects };
