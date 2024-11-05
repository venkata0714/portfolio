const express = require('express');
const router = express.Router();
const { getProjects } = require('../controllers/projectController');

// Define route for retrieving projects
router.get('/getprojects', getProjects);

module.exports = router;
