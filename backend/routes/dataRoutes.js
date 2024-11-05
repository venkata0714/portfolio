const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectByLink,
  getInvolvements,
  getInvolvementByLink,
  getExperiences,
  getExperienceByLink,
  getYearInReviews,
  getYearInReviewByLink,
  getHonorsExperiences,
  getHonorsExperienceByLink
} = require('../controllers/dataController');

// Routes for Projects
router.get('/getprojects', getProjects);
router.get('/getprojects/:projectLink', getProjectByLink);

// Routes for Involvements
router.get('/getinvolvements', getInvolvements);
router.get('/getinvolvements/:involvementLink', getInvolvementByLink);

// Routes for Experiences
router.get('/getexperiences', getExperiences);
router.get('/getexperiences/:experienceLink', getExperienceByLink);

// Routes for Year In Reviews
router.get('/getyearinreviews', getYearInReviews);
router.get('/getyearinreviews/:yearInReviewLink', getYearInReviewByLink);

// Routes for Honors Experiences
router.get('/gethonorsexperiences', getHonorsExperiences);
router.get('/gethonorsexperiences/:honorsExperienceLink', getHonorsExperienceByLink);

module.exports = router;
