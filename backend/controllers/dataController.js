const bcrypt = require("bcrypt");
const { getDB } = require("../config/mongodb");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

// Helper: convert a route parameter to an ObjectId
function getObjectId(id) {
  // If id consists only of digits, assume it’s a timestamp (in seconds)
  if (/^\d+$/.test(id)) {
    return ObjectId.createFromTime(Number(id));
  } else if (ObjectId.isValid(id)) {
    // For a typical 24-character hex string, use createFromHexString
    return ObjectId.createFromHexString(id);
  } else {
    throw new Error("Invalid id format");
  }
}

// Helper function to fetch all documents (excluding soft-deleted items)
const getAllDocuments = async (collectionName, res) => {
  try {
    const db = getDB();
    const documents = await db
      .collection(collectionName)
      .find({ deleted: { $ne: true } })
      .toArray();
    res.json(documents);
  } catch (error) {
    console.error(`Error fetching documents from ${collectionName}:`, error);
    res
      .status(500)
      .json({ message: `Error fetching documents from ${collectionName}` });
  }
};

// Helper function to fetch a single document by typeLink (excluding soft-deleted items)
const getDocumentByLink = async (collectionName, linkField, linkValue, res) => {
  try {
    const db = getDB();
    const document = await db
      .collection(collectionName)
      .findOne({ [linkField]: linkValue, deleted: { $ne: true } });
    if (document) {
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

// Projects
const getProjects = (req, res) => getAllDocuments("projectTable", res);
const getProjectByLink = (req, res) =>
  getDocumentByLink("projectTable", "projectLink", req.params.projectLink, res);

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

// Skills
const getSkills = (req, res) => getAllDocuments("skillsCollection", res);
const getSkillComponents = (req, res) => getAllDocuments("skillsTable", res);

const getCollectionCounts = async (req, res) => {
  try {
    const db = getDB();
    const collections = {
      skillsCollection: await db
        .collection("skillsCollection")
        .countDocuments({ deleted: { $ne: true } }),
      skillsTable: await db
        .collection("skillsTable")
        .countDocuments({ deleted: { $ne: true } }),
      projectTable: await db
        .collection("projectTable")
        .countDocuments({ deleted: { $ne: true } }),
      experienceTable: await db
        .collection("experienceTable")
        .countDocuments({ deleted: { $ne: true } }),
      involvementTable: await db
        .collection("involvementTable")
        .countDocuments({ deleted: { $ne: true } }),
      honorsExperienceTable: await db
        .collection("honorsExperienceTable")
        .countDocuments({ deleted: { $ne: true } }),
      yearInReviewTable: await db
        .collection("yearInReviewTable")
        .countDocuments({ deleted: { $ne: true } }),
      KartavyaPortfolio: await db
        .collection("KartavyaPortfolio")
        .countDocuments(),
      FeedTable: await db
        .collection("FeedTable")
        .countDocuments({ deleted: { $ne: true } }),
    };

    res.json(collections);
  } catch (error) {
    console.error("Error fetching collection counts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Compare Admin Username
const compareAdminName = async (req, res) => {
  const { userName } = req.body;
  const db = getDB();
  const admin = await db.collection("KartavyaPortfolio").findOne({});
  if (!admin) return res.status(404).json({ message: "No Admin found." });
  const match = await bcrypt.compare(userName, admin.userName);
  return match
    ? res.json({ success: true })
    : res.status(401).json({ message: "Incorrect Username" });
};

// Compare Admin Password and Send OTP
const compareAdminPassword = async (req, res) => {
  const { password } = req.body;
  const db = getDB();
  try {
    const admin = await db.collection("KartavyaPortfolio").findOne({});
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ message: "Incorrect Password" });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expireTime = new Date(Date.now() + 5 * 60000);
    await db.collection("KartavyaPortfolioOTP").deleteMany({});
    await db.collection("KartavyaPortfolioOTP").insertOne({ otp, expireTime });
    res.json({ success: true, otpSent: true, otp: otp, message: "OTP sent." });
  } catch (error) {
    res.status(500).json({ message: "Error comparing passwords." });
  }
};

const compareOTP = async (req, res) => {
  const { otp, rememberMe = false } = req.body;
  const db = getDB();
  try {
    const otpData = await db.collection("KartavyaPortfolioOTP").findOne({});
    if (!otpData || otpData.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const currentTime = new Date();
    if (otpData.expiry < currentTime) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // const expiresIn = rememberMe ? "1m" : "1hr"; // 1 week vs 1 hour
    const expiresIn = rememberMe ? "365d" : "1h"; // 1 week vs 1 hour
    const token = jwt.sign({ user: "admin" }, process.env.JWT_SECRET, {
      expiresIn,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      // maxAge: rememberMe ? 60000 : 3600000, // 7 days vs 1 hour
      maxAge: rememberMe ? 365 * 24 * 60 * 60 * 1000 : 3600000, // 365 days vs 1 hour
      // 365 * 24 * 60 * 60 * 1000 = 31536000000ms = 365 days = 1 year
      // 3600000 ms = 1 hour
    });

    await db.collection("KartavyaPortfolioOTP").deleteOne({}); // OTP invalidation

    return res.json({ success: true, message: "Logged in successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const logoutAdmin = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.json({ success: true, message: "Logged out successfully!" });
};

// Admin management – update credentials (requires current password)
const setAdminCredentials = async (req, res) => {
  const { userName, password, currentPassword } = req.body;
  const db = getDB();
  try {
    const admin = await db.collection("KartavyaPortfolio").findOne({});
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }
    const passwordMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ message: "Current password is incorrect." });
    }
    const hashedUsername = await bcrypt.hash(userName, 10);
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.collection("KartavyaPortfolio").deleteMany({});
    await db.collection("KartavyaPortfolio").insertOne({
      userName: hashedUsername,
      password: hashedPassword,
    });
    res.json({ success: true, message: "Admin credentials set." });
  } catch (error) {
    console.error("Error setting admin credentials:", error);
    res.status(500).json({ message: "Error setting credentials." });
  }
};

// CRUD functions for Projects (soft delete)
const addProject = async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection("projectTable").insertOne(req.body);
    res.json({
      success: true,
      message: "Project added.",
      newItem: { ...req.body, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error adding project:", error);
    res.status(500).json({ message: "Error adding project." });
  }
};
const updateProject = async (req, res) => {
  try {
    const db = getDB();
    // Remove _id from the update payload
    const { _id, ...updateData } = req.body;
    await db
      .collection("projectTable")
      .updateOne({ _id: getObjectId(req.params.id) }, { $set: updateData });
    res.json({ success: true, message: "Project updated." });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Error updating project." });
  }
};
const deleteProject = async (req, res) => {
  try {
    const db = getDB();
    await db
      .collection("projectTable")
      .updateOne(
        { _id: getObjectId(req.params.id) },
        { $set: { deleted: true } }
      );
    // Hard delete (commented out):
    // await db.collection("projectTable").deleteOne({ _id: getObjectId(req.params.id) });
    res.json({ success: true, message: "Project soft deleted." });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: "Error deleting project." });
  }
};

// Involvements
const addInvolvement = async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection("involvementTable").insertOne(req.body);
    res.json({
      success: true,
      message: "Involvement added.",
      newItem: { ...req.body, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error adding involvement:", error);
    res.status(500).json({ message: "Error adding involvement." });
  }
};
const updateInvolvement = async (req, res) => {
  try {
    const db = getDB();
    const { _id, ...updateData } = req.body;
    await db
      .collection("involvementTable")
      .updateOne({ _id: getObjectId(req.params.id) }, { $set: updateData });
    res.json({ success: true, message: "Involvement updated." });
  } catch (error) {
    console.error("Error updating involvement:", error);
    res.status(500).json({ message: "Error updating involvement." });
  }
};
const deleteInvolvement = async (req, res) => {
  try {
    const db = getDB();
    await db
      .collection("involvementTable")
      .updateOne(
        { _id: getObjectId(req.params.id) },
        { $set: { deleted: true } }
      );
    // Hard delete (commented out):
    // await db.collection("involvementTable").deleteOne({ _id: getObjectId(req.params.id) });
    res.json({ success: true, message: "Involvement soft deleted." });
  } catch (error) {
    console.error("Error deleting involvement:", error);
    res.status(500).json({ message: "Error deleting involvement." });
  }
};

// Experiences
const addExperience = async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection("experienceTable").insertOne(req.body);
    res.json({
      success: true,
      message: "Experience added.",
      newItem: { ...req.body, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error adding experience:", error);
    res.status(500).json({ message: "Error adding experience." });
  }
};
const updateExperience = async (req, res) => {
  try {
    const db = getDB();
    const { _id, ...updateData } = req.body;
    await db
      .collection("experienceTable")
      .updateOne({ _id: getObjectId(req.params.id) }, { $set: updateData });
    res.json({ success: true, message: "Experience updated." });
  } catch (error) {
    console.error("Error updating experience:", error);
    res.status(500).json({ message: "Error updating experience." });
  }
};
const deleteExperience = async (req, res) => {
  try {
    const db = getDB();
    await db
      .collection("experienceTable")
      .updateOne(
        { _id: getObjectId(req.params.id) },
        { $set: { deleted: true } }
      );
    // Hard delete (commented out):
    // await db.collection("experienceTable").deleteOne({ _id: getObjectId(req.params.id) });
    res.json({ success: true, message: "Experience soft deleted." });
  } catch (error) {
    console.error("Error deleting experience:", error);
    res.status(500).json({ message: "Error deleting experience." });
  }
};

// Year In Reviews
const addYearInReview = async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection("yearInReviewTable").insertOne(req.body);
    res.json({
      success: true,
      message: "YearInReview added.",
      newItem: { ...req.body, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error adding year-in-review:", error);
    res.status(500).json({ message: "Error adding year-in-review." });
  }
};
const updateYearInReview = async (req, res) => {
  try {
    const db = getDB();
    const { _id, ...updateData } = req.body;
    await db
      .collection("yearInReviewTable")
      .updateOne({ _id: getObjectId(req.params.id) }, { $set: updateData });
    res.json({ success: true, message: "YearInReview updated." });
  } catch (error) {
    console.error("Error updating year-in-review:", error);
    res.status(500).json({ message: "Error updating year-in-review." });
  }
};
const deleteYearInReview = async (req, res) => {
  try {
    const db = getDB();
    await db
      .collection("yearInReviewTable")
      .updateOne(
        { _id: getObjectId(req.params.id) },
        { $set: { deleted: true } }
      );
    // Hard delete (commented out):
    // await db.collection("yearInReviewTable").deleteOne({ _id: getObjectId(req.params.id) });
    res.json({ success: true, message: "YearInReview soft deleted." });
  } catch (error) {
    console.error("Error deleting year-in-review:", error);
    res.status(500).json({ message: "Error deleting year-in-review." });
  }
};

// Honors Experiences
const addHonorsExperience = async (req, res) => {
  try {
    const db = getDB();
    const result = await db
      .collection("honorsExperienceTable")
      .insertOne(req.body);
    res.json({
      success: true,
      message: "HonorsExperience added.",
      newItem: { ...req.body, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error adding honors experience:", error);
    res.status(500).json({ message: "Error adding honors experience." });
  }
};
const updateHonorsExperience = async (req, res) => {
  try {
    const db = getDB();
    const { _id, ...updateData } = req.body;
    await db
      .collection("honorsExperienceTable")
      .updateOne({ _id: getObjectId(req.params.id) }, { $set: updateData });
    res.json({ success: true, message: "HonorsExperience updated." });
  } catch (error) {
    console.error("Error updating honors experience:", error);
    res.status(500).json({ message: "Error updating honors experience." });
  }
};
const deleteHonorsExperience = async (req, res) => {
  try {
    const db = getDB();
    await db
      .collection("honorsExperienceTable")
      .updateOne(
        { _id: getObjectId(req.params.id) },
        { $set: { deleted: true } }
      );
    // Hard delete (commented out):
    // await db.collection("honorsExperienceTable").deleteOne({ _id: getObjectId(req.params.id) });
    res.json({ success: true, message: "HonorsExperience soft deleted." });
  } catch (error) {
    console.error("Error deleting honors experience:", error);
    res.status(500).json({ message: "Error deleting honors experience." });
  }
};

// Skills Collection
const addSkill = async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection("skillsCollection").insertOne(req.body);
    res.json({
      success: true,
      message: "Skill added.",
      newItem: { ...req.body, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error adding skill:", error);
    res.status(500).json({ message: "Error adding skill." });
  }
};
const updateSkill = async (req, res) => {
  try {
    const db = getDB();
    const { _id, ...updateData } = req.body;
    await db
      .collection("skillsCollection")
      .updateOne({ _id: getObjectId(req.params.id) }, { $set: updateData });
    res.json({ success: true, message: "Skill updated." });
  } catch (error) {
    console.error("Error updating skill:", error);
    res.status(500).json({ message: "Error updating skill." });
  }
};
const deleteSkill = async (req, res) => {
  try {
    const db = getDB();
    await db
      .collection("skillsCollection")
      .updateOne(
        { _id: getObjectId(req.params.id) },
        { $set: { deleted: true } }
      );
    // Hard delete (commented out):
    // await db.collection("skillsCollection").deleteOne({ _id: getObjectId(req.params.id) });
    res.json({ success: true, message: "Skill soft deleted." });
  } catch (error) {
    console.error("Error deleting skill:", error);
    res.status(500).json({ message: "Error deleting skill." });
  }
};

// Skills Table (Skill Components)
const addSkillComponent = async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection("skillsTable").insertOne(req.body);
    res.json({
      success: true,
      message: "SkillComponent added.",
      newItem: { ...req.body, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error adding skill component:", error);
    res.status(500).json({ message: "Error adding skill component." });
  }
};
const updateSkillComponent = async (req, res) => {
  try {
    const db = getDB();
    const { _id, ...updateData } = req.body;
    await db
      .collection("skillsTable")
      .updateOne({ _id: getObjectId(req.params.id) }, { $set: updateData });
    res.json({ success: true, message: "SkillComponent updated." });
  } catch (error) {
    console.error("Error updating skill component:", error);
    res.status(500).json({ message: "Error updating skill component." });
  }
};
const deleteSkillComponent = async (req, res) => {
  try {
    const db = getDB();
    await db
      .collection("skillsTable")
      .updateOne(
        { _id: getObjectId(req.params.id) },
        { $set: { deleted: true } }
      );
    // Hard delete (commented out):
    // await db.collection("skillsTable").deleteOne({ _id: getObjectId(req.params.id) });
    res.json({ success: true, message: "SkillComponent soft deleted." });
  } catch (error) {
    console.error("Error deleting skill component:", error);
    res.status(500).json({ message: "Error deleting skill component." });
  }
};

const getFeeds = async (req, res) => {
  try {
    const db = getDB();
    const feeds = await db
      .collection("FeedTable")
      .find({ deleted: { $ne: true } })
      .sort({ feedCreatedAt: -1 }) // sorts in descending order by created timestamp
      .toArray();
    res.json(feeds);
  } catch (error) {
    console.error("Error fetching feeds:", error);
    res.status(500).json({ message: "Error fetching feeds", error });
  }
};

const addFeed = async (req, res) => {
  const { feedTitle, feedCategory, feedContent, feedImageURL, feedLinks } =
    req.body;

  // Validate mandatory fields
  if (!feedTitle || !feedCategory) {
    return res
      .status(400)
      .json({ message: "feedTitle and feedCategory are required." });
  }

  try {
    const db = getDB();
    const newFeed = {
      feedTitle,
      feedCategory,
      feedContent: feedContent || [],
      feedImageURL: feedImageURL || null,
      feedLinks: feedLinks || [],
      feedCreatedAt: new Date().toISOString(), // or use new Date() if you prefer a Date object
    };
    const result = await db.collection("FeedTable").insertOne(newFeed);
    res.json({
      success: true,
      message: "Feed added successfully.",
      newItem: { ...newFeed, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error adding feed:", error);
    res.status(500).json({ message: "Error adding feed", error });
  }
};

const deleteFeed = async (req, res) => {
  try {
    const db = getDB();
    // Using the helper getObjectId from the file (see :contentReference[oaicite:2]{index=2}&#8203;:contentReference[oaicite:3]{index=3})
    const id = req.params.id;
    await db
      .collection("FeedTable")
      .updateOne({ _id: getObjectId(id) }, { $set: { deleted: true } });
    res.json({ success: true, message: "Feed soft deleted." });
  } catch (error) {
    console.error("Error deleting feed:", error);
    res.status(500).json({ message: "Error deleting feed", error });
  }
};

const editFeed = async (req, res) => {
  try {
    const db = getDB();
    const id = req.params.id;
    const { _id, ...updateData } = req.body; // Exclude _id from update data
    await db
      .collection("FeedTable")
      .updateOne({ _id: getObjectId(id) }, { $set: updateData });
    res.json({ success: true, message: "Feed updated." });
  } catch (error) {
    console.error("Error editing feed:", error);
    res.status(500).json({ message: "Error editing feed", error });
  }
};

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
};
