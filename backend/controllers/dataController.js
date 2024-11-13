const { getDB } = require("../config/mongodb");

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
    res
      .status(500)
      .json({
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
};
