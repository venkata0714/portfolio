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
  setAdminCredentials,
  addProject,
  updateProject,
  deleteProject,
  addInvolvement,
  updateInvolvement,
  deleteInvolvement,
  addExperience,
  updateExperience,
  deleteExperience,
  addYearInReview,
  updateYearInReview,
  deleteYearInReview,
  addHonorsExperience,
  updateHonorsExperience,
  deleteHonorsExperience,
  addSkill,
  updateSkill,
  deleteSkill,
  addSkillComponent,
  updateSkillComponent,
  deleteSkillComponent,
  getFeeds,
  addFeed,
  deleteFeed,
  editFeed,
  addLike,
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
    await db.collection("someCollection").findOne();
    res.json({ message: "MongoDB is active" });
  } catch (error) {
    res.status(500).json({ message: "MongoDB is not connected", error });
  }
});

// Projects
router.get("/getprojects", getProjects);
router.get("/getprojects/:projectLink", getProjectByLink);
router.post("/addproject", verifyJWT, addProject);
router.put("/updateproject/:id", verifyJWT, updateProject);
router.delete("/deleteproject/:id", verifyJWT, deleteProject);

// Involvements
router.get("/getinvolvements", getInvolvements);
router.get("/getinvolvements/:involvementLink", getInvolvementByLink);
router.post("/addinvolvement", verifyJWT, addInvolvement);
router.put("/updateinvolvement/:id", verifyJWT, updateInvolvement);
router.delete("/deleteinvolvement/:id", verifyJWT, deleteInvolvement);

// Experiences
router.get("/getexperiences", getExperiences);
router.get("/getexperiences/:experienceLink", getExperienceByLink);
router.post("/addexperience", verifyJWT, addExperience);
router.put("/updateexperience/:id", verifyJWT, updateExperience);
router.delete("/deleteexperience/:id", verifyJWT, deleteExperience);

// Year In Reviews
router.get("/getyearinreviews", getYearInReviews);
router.get("/getyearinreviews/:yearInReviewLink", getYearInReviewByLink);
router.post("/addyearinreview", verifyJWT, addYearInReview);
router.put("/updateyearinreview/:id", verifyJWT, updateYearInReview);
router.delete("/deleteyearinreview/:id", verifyJWT, deleteYearInReview);

// Honors Experiences
router.get("/gethonorsexperiences", getHonorsExperiences);
router.get(
  "/gethonorsexperiences/:honorsExperienceLink",
  getHonorsExperienceByLink
);
router.post("/addhonorsexperience", verifyJWT, addHonorsExperience);
router.put("/updatehonorsexperience/:id", verifyJWT, updateHonorsExperience);
router.delete("/deletehonorsexperience/:id", verifyJWT, deleteHonorsExperience);

// Skills
router.get("/getskills", getSkills);
router.get("/getskillcomponents", getSkillComponents);
router.post("/addskill", verifyJWT, addSkill);
router.put("/updateskill/:id", verifyJWT, updateSkill);
router.delete("/deleteskill/:id", verifyJWT, deleteSkill);
router.post("/addskillcomponent", verifyJWT, addSkillComponent);
router.put("/updateskillcomponent/:id", verifyJWT, updateSkillComponent);
router.delete("/deleteskillcomponent/:id", verifyJWT, deleteSkillComponent);
router.get("/getFeeds", getFeeds);
router.post("/addFeed", verifyJWT, addFeed);
router.delete("/deleteFeed/:id", verifyJWT, deleteFeed);
router.put("/updateFeed/:id", verifyJWT, editFeed);

// Admin Management
router.post("/setAdminCredentials", verifyJWT, setAdminCredentials);
router.post("/compareAdminName", compareAdminName);
router.post("/compareAdminPassword", compareAdminPassword);
router.post("/compareOTP", compareOTP);
router.get("/logout", logoutAdmin);

router.get("/collection-counts", getCollectionCounts);

router.post("/addLike", addLike);

module.exports = router;
