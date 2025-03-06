const bcrypt = require("bcrypt");
const { getDB } = require("../config/mongodb");

// const setAdminCredentials = async (req, res) => {
//   const { userName, password } = req.body;
//   const db = getDB();

//   try {
//     const hashedUsername = await bcrypt.hash(userName, 10);
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Always store only one admin credentials
//     await db.collection("KartavyaPortfolio").deleteMany({});
//     await db.collection("KartavyaPortfolio").insertOne({
//       userName: hashedUsername,
//       password: hashedPassword,
//     });

//     res.json({ success: true, message: "Admin credentials set." });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error setting credentials." });
//   }
// };

// Helper function to fetch all documents from a collection

const getAllDocuments = async (collectionName, res) => {
  try {
    const db = getDB();
    const documents = await db.collection(collectionName).find().toArray();
    // console.log(`Fetched all documents from ${collectionName}:`, documents);
    res.json(documents);
  } catch (error) {
    console.error(`Error fetching documents from ${collectionName}:`, error);
    res
      .status(500)
      .json({ message: `Error fetching documents from ${collectionName}` });
  }
};

// Helper function to fetch a single document by typeLink
const getDocumentByLink = async (collectionName, linkField, linkValue, res) => {
  try {
    const db = getDB();
    const document = await db
      .collection(collectionName)
      .findOne({ [linkField]: linkValue });

    if (document) {
      // console.log(`Fetched document from ${collectionName}:`, document);
      res.json(document);
    } else {
      res
        .status(404)
        .json({ message: `${collectionName.slice(0, -5)} not found` });
    }
  } catch (error) {
    console.error(
      `Error fetching document by link from ${collectionName}:`,
      error
    );
    res.status(500).json({
      message: `Error fetching document by link from ${collectionName}`,
    });
  }
};

// Controllers for each type

// Projects
const getProjects = (req, res) => getAllDocuments("projectTable", res);
const getProjectByLink = (req, res) =>
  getAllDocuments("projectTable", "projectLink", req.params.projectLink, res);

// Involvements
const getInvolvements = (req, res) => getAllDocuments("involvementTable", res);
const getInvolvementByLink = (req, res) =>
  getDocumentByLink(
    "involvementTable",
    "involvementLink",
    req.params.involvementLink,
    res
  );

// Experiences
const getExperiences = (req, res) => getAllDocuments("experienceTable", res);
const getExperienceByLink = (req, res) =>
  getDocumentByLink(
    "experienceTable",
    "experienceLink",
    req.params.experienceLink,
    res
  );

// Year In Reviews
const getYearInReviews = (req, res) =>
  getAllDocuments("yearInReviewTable", res);
const getYearInReviewByLink = (req, res) =>
  getDocumentByLink(
    "yearInReviewTable",
    "yearInReviewLink",
    req.params.yearInReviewLink,
    res
  );

// Honors Experiences
const getHonorsExperiences = (req, res) =>
  getAllDocuments("honorsExperienceTable", res);
const getHonorsExperienceByLink = (req, res) =>
  getDocumentByLink(
    "honorsExperienceTable",
    "honorsExperienceLink",
    req.params.honorsExperienceLink,
    res
  );

const getSkills = (req, res) => getAllDocuments("skillsTable", res);

// Compares Admin Username
const compareAdminName = async (req, res) => {
  const { userName } = req.body;
  const db = getDB();
  try {
    const admin = await db.collection("KartavyaPortfolio").findOne({});
    if (!admin) return res.status(404).json({ message: "No Admin Found" });

    const match = await bcrypt.compare(userName, admin.userName);
    match
      ? res.json({ success: true })
      : res.status(401).json({ message: "Incorrect Username" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error comparing username" });
  }
};

const compareAdminPassword = async (req, res) => {
  const { password } = req.body;
  const db = getDB();

  try {
    const admin = await db.collection("KartavyaPortfolio").findOne({});
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const match = await bcrypt.compare(password, admin.password);
    match
      ? res.json({ success: true })
      : res.status(401).json({ message: "Incorrect Password" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error comparing passwords." });
  }
};

const getSkillComponents = (req, res) =>
  getAllDocuments("skillsCollection", res);

module.exports = {
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
  // setAdminCredentials,
};
