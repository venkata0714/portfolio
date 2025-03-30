// routes/dataRoutes.js
async function routes(fastify, options) {
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

  // Projects
  fastify.get("/getprojects", getProjects);
  fastify.get("/getprojects/:projectLink", getProjectByLink);
  fastify.post("/addproject", { preHandler: verifyJWT }, addProject);
  fastify.put("/updateproject/:id", { preHandler: verifyJWT }, updateProject);
  fastify.delete(
    "/deleteproject/:id",
    { preHandler: verifyJWT },
    deleteProject
  );
  E;

  // Involvements
  fastify.get("/getinvolvements", getInvolvements);
  fastify.get("/getinvolvements/:involvementLink", getInvolvementByLink);
  fastify.post("/addinvolvement", { preHandler: verifyJWT }, addInvolvement);
  fastify.put(
    "/updateinvolvement/:id",
    { preHandler: verifyJWT },
    updateInvolvement
  );
  fastify.delete(
    "/deleteinvolvement/:id",
    { preHandler: verifyJWT },
    deleteInvolvement
  );

  // Experiences
  fastify.get("/getexperiences", getExperiences);
  fastify.get("/getexperiences/:experienceLink", getExperienceByLink);
  fastify.post("/addexperience", { preHandler: verifyJWT }, addExperience);
  fastify.put(
    "/updateexperience/:id",
    { preHandler: verifyJWT },
    updateExperience
  );
  fastify.delete(
    "/deleteexperience/:id",
    { preHandler: verifyJWT },
    deleteExperience
  );

  // Year In Reviews
  fastify.get("/getyearinreviews", getYearInReviews);
  fastify.get("/getyearinreviews/:yearInReviewLink", getYearInReviewByLink);
  fastify.post("/addyearinreview", { preHandler: verifyJWT }, addYearInReview);
  fastify.put(
    "/updateyearinreview/:id",
    { preHandler: verifyJWT },
    updateYearInReview
  );
  fastify.delete(
    "/deleteyearinreview/:id",
    { preHandler: verifyJWT },
    deleteYearInReview
  );

  // Honors Experiences
  fastify.get("/gethonorsexperiences", getHonorsExperiences);
  fastify.get(
    "/gethonorsexperiences/:honorsExperienceLink",
    getHonorsExperienceByLink
  );
  fastify.post(
    "/addhonorsexperience",
    { preHandler: verifyJWT },
    addHonorsExperience
  );
  fastify.put(
    "/updatehonorsexperience/:id",
    { preHandler: verifyJWT },
    updateHonorsExperience
  );
  fastify.delete(
    "/deletehonorsexperience/:id",
    { preHandler: verifyJWT },
    deleteHonorsExperience
  );

  // Skills
  fastify.get("/getskills", getSkills);
  fastify.get("/getskillcomponents", getSkillComponents);
  fastify.post("/addskill", { preHandler: verifyJWT }, addSkill);
  fastify.put("/updateskill/:id", { preHandler: verifyJWT }, updateSkill);
  fastify.delete("/deleteskill/:id", { preHandler: verifyJWT }, deleteSkill);
  fastify.post(
    "/addskillcomponent",
    { preHandler: verifyJWT },
    addSkillComponent
  );
  fastify.put(
    "/updateskillcomponent/:id",
    { preHandler: verifyJWT },
    updateSkillComponent
  );
  fastify.delete(
    "/deleteskillcomponent/:id",
    { preHandler: verifyJWT },
    deleteSkillComponent
  );

  // Feeds
  fastify.get("/getFeeds", getFeeds);
  fastify.post("/addFeed", { preHandler: verifyJWT }, addFeed);
  fastify.delete("/deleteFeed/:id", { preHandler: verifyJWT }, deleteFeed);
  fastify.put("/updateFeed/:id", { preHandler: verifyJWT }, editFeed);

  // Admin Management
  fastify.post(
    "/setAdminCredentials",
    { preHandler: verifyJWT },
    setAdminCredentials
  );
  fastify.post("/compareAdminName", compareAdminName);
  fastify.post("/compareAdminPassword", compareAdminPassword);
  fastify.post("/compareOTP", compareOTP);
  fastify.get("/logout", logoutAdmin);

  fastify.get("/collection-counts", getCollectionCounts);

  // Likes
  fastify.post("/addLike", addLike);
}

module.exports = routes;
