const express = require("express");
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
  getHonorsExperienceByLink,
  getSkills,
  getSkillComponents,
  compareAdminName,
  compareAdminPassword,
  compareOTP,
  logoutAdmin,
  getCollectionCounts,
  // setAdminCredentials,
} = require("../controllers/dataController");

const verifyJWT = require("../controllers/middlewareController");

router.get("/check-cookie", verifyJWT, (req, res) => {
  res.json({
    message: "Protected Cookie. Logged In as Admin!",
    valid: true,
    user: req.user,
  });
});

router.get("/ping", (req, res) => {
  res.json({ message: "Backend is active" });
});

const { getDB } = require("../config/mongodb");
router.get("/db-ping", async (req, res) => {
  try {
    const db = getDB();
    await db.collection("someCollection").findOne(); // Replace 'someCollection' with an actual collection
    res.json({ message: "MongoDB is active" });
  } catch (error) {
    res.status(500).json({ message: "MongoDB is not connected", error });
  }
});

// Routes for Projects
router.get("/getprojects", getProjects);
router.get("/getprojects/:projectLink", getProjectByLink);

// Routes for Involvements
router.get("/getinvolvements", getInvolvements);
router.get("/getinvolvements/:involvementLink", getInvolvementByLink);

// Routes for Experiences
router.get("/getexperiences", getExperiences);
router.get("/getexperiences/:experienceLink", getExperienceByLink);

// Routes for Year In Reviews
router.get("/getyearinreviews", getYearInReviews);
router.get("/getyearinreviews/:yearInReviewLink", getYearInReviewByLink);

// Routes for Honors Experiences
router.get("/gethonorsexperiences", getHonorsExperiences);
router.get(
  "/gethonorsexperiences/:honorsExperienceLink",
  getHonorsExperienceByLink
);

// Routes for Skills
router.get("/getskills", getSkills);
router.get("/getskillcomponents", getSkillComponents);

// router.post("/setAdminCredentials", setAdminCredentials);
router.post("/compareAdminName", compareAdminName);
router.post("/compareAdminPassword", compareAdminPassword);
router.post("/compareOTP", compareOTP);
router.get("/logout", logoutAdmin);

router.get("/collection-counts", getCollectionCounts);

module.exports = router;
