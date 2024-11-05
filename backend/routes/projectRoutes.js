const express = require('express');
const router = express.Router();
const { getProjects, getProjectByLink } = require('../controllers/projectController');

// Route to get all projects
router.get('/getprojects', getProjects);

// Route to get a specific project by projectLink
router.get('/getprojects/:projectLink', getProjectByLink);

module.exports = router;
