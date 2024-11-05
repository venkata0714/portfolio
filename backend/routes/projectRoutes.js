// backend/routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const { getProjects } = require('../controllers/projectController');

// Define the route for getting projects
router.get('/getprojects', getProjects);

module.exports = router;
