// controllers/dataController.js
const bcrypt = require("bcrypt");
const { getDB } = require("../config/mongodb");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

function getObjectId(id) {
  if (/^\d+$/.test(id)) {
    return ObjectId.createFromTime(Number(id));
  } else if (ObjectId.isValid(id)) {
    return ObjectId.createFromHexString(id);
  } else {
    throw new Error("Invalid id format");
  }
}

const getAllDocuments = async (collectionName, reply) => {
  try {
    const db = getDB();
    const documents = await db
      .collection(collectionName)
      .find({ deleted: { $ne: true } })
      .toArray();
    reply.send(documents);
  } catch (error) {
    console.error(`Error fetching documents from ${collectionName}:`, error);
    reply
      .status(500)
      .send({ message: `Error fetching documents from ${collectionName}` });
  }
};

const getDocumentByLink = async (
  collectionName,
  linkField,
  linkValue,
  reply
) => {
  try {
    const db = getDB();
    const document = await db
      .collection(collectionName)
      .findOne({ [linkField]: linkValue, deleted: { $ne: true } });
    if (document) {
      reply.send(document);
    } else {
      reply
        .status(404)
        .send({ message: `${collectionName.slice(0, -5)} not found` });
    }
  } catch (error) {
    console.error(
      `Error fetching document by link from ${collectionName}:`,
      error
    );
    reply.status(500).send({
      message: `Error fetching document by link from ${collectionName}`,
    });
  }
};

// Projects
const getProjects = (req, reply) => getAllDocuments("projectTable", reply);
const getProjectByLink = (req, reply) =>
  getDocumentByLink(
    "projectTable",
    "projectLink",
    req.params.projectLink,
    reply
  );

// Involvements
const getInvolvements = (req, reply) =>
  getAllDocuments("involvementTable", reply);
const getInvolvementByLink = (req, reply) =>
  getDocumentByLink(
    "involvementTable",
    "involvementLink",
    req.params.involvementLink,
    reply
  );

// Experiences
const getExperiences = (req, reply) =>
  getAllDocuments("experienceTable", reply);
const getExperienceByLink = (req, reply) =>
  getDocumentByLink(
    "experienceTable",
    "experienceLink",
    req.params.experienceLink,
    reply
  );

// Year In Reviews
const getYearInReviews = (req, reply) =>
  getAllDocuments("yearInReviewTable", reply);
const getYearInReviewByLink = (req, reply) =>
  getDocumentByLink(
    "yearInReviewTable",
    "yearInReviewLink",
    req.params.yearInReviewLink,
    reply
  );

// Honors Experiences
const getHonorsExperiences = (req, reply) =>
  getAllDocuments("honorsExperienceTable", reply);
const getHonorsExperienceByLink = (req, reply) =>
  getDocumentByLink(
    "honorsExperienceTable",
    "honorsExperienceLink",
    req.params.honorsExperienceLink,
    reply
  );

// Skills
const getSkills = (req, reply) => getAllDocuments("skillsCollection", reply);
const getSkillComponents = (req, reply) =>
  getAllDocuments("skillsTable", reply);

const getCollectionCounts = async (req, reply) => {
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

    reply.send(collections);
  } catch (error) {
    console.error("Error fetching collection counts:", error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

const compareAdminName = async (req, reply) => {
  const { userName } = req.body;
  const db = getDB();
  const admin = await db.collection("KartavyaPortfolio").findOne({});
  if (!admin) return reply.status(404).send({ message: "No Admin found." });
  const match = await bcrypt.compare(userName, admin.userName);
  return match
    ? reply.send({ success: true })
    : reply.status(401).send({ message: "Incorrect Username" });
};

const compareAdminPassword = async (req, reply) => {
  const { password } = req.body;
  const db = getDB();
  try {
    const admin = await db.collection("KartavyaPortfolio").findOne({});
    if (!admin) return reply.status(404).send({ message: "Admin not found" });
    const match = await bcrypt.compare(password, admin.password);
    if (!match)
      return reply.status(401).send({ message: "Incorrect Password" });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expireTime = new Date(Date.now() + 5 * 60000);
    await db.collection("KartavyaPortfolioOTP").deleteMany({});
    await db.collection("KartavyaPortfolioOTP").insertOne({ otp, expireTime });
    reply.send({ success: true, otpSent: true, otp, message: "OTP sent." });
  } catch (error) {
    reply.status(500).send({ message: "Error comparing passwords." });
  }
};

const compareOTP = async (req, reply) => {
  const { otp, rememberMe = false } = req.body;
  const db = getDB();
  try {
    const otpData = await db.collection("KartavyaPortfolioOTP").findOne({});
    if (!otpData || otpData.otp !== otp) {
      return reply.status(400).send({ message: "Invalid OTP" });
    }
    const currentTime = new Date();
    if (otpData.expiry < currentTime) {
      return reply.status(400).send({ message: "OTP expired" });
    }
    const expiresIn = rememberMe ? "365d" : "1h";
    const token = jwt.sign({ user: "admin" }, process.env.JWT_SECRET, {
      expiresIn,
    });
    reply.setCookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: rememberMe ? 365 * 24 * 60 * 60 * 1000 : 3600000,
    });
    await db.collection("KartavyaPortfolioOTP").deleteOne({});
    return reply.send({ success: true, message: "Logged in successfully!" });
  } catch (err) {
    reply.status(500).send({ message: "Server error" });
  }
};

const logoutAdmin = (req, reply) => {
  reply.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  reply.send({ success: true, message: "Logged out successfully!" });
};

const setAdminCredentials = async (req, reply) => {
  const { userName, password, currentPassword } = req.body;
  const db = getDB();
  try {
    const admin = await db.collection("KartavyaPortfolio").findOne({});
    if (!admin) return reply.status(404).send({ message: "Admin not found." });
    const passwordMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!passwordMatch)
      return reply
        .status(401)
        .send({ message: "Current password is incorrect." });
    const hashedUsername = await bcrypt.hash(userName, 10);
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.collection("KartavyaPortfolio").deleteMany({});
    await db
      .collection("KartavyaPortfolio")
      .insertOne({ userName: hashedUsername, password: hashedPassword });
    reply.send({ success: true, message: "Admin credentials set." });
  } catch (error) {
    console.error("Error setting admin credentials:", error);
    reply.status(500).send({ message: "Error setting credentials." });
  }
};

// Projects CRUD
const addProject = async (req, reply) => {
  try {
    const db = getDB();
    const result = await db.collection("projectTable").insertOne(req.body);
    reply.send({
      success: true,
      message: "Project added.",
      newItem: { ...req.body, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error adding project:", error);
    reply.status(500).send({ message: "Error adding project." });
  }
};
const updateProject = async (req, reply) => {
  try {
    const db = getDB();
    const { _id, ...updateData } = req.body;
    await db
      .collection("projectTable")
      .updateOne({ _id: getObjectId(req.params.id) }, { $set: updateData });
    reply.send({ success: true, message: "Project updated." });
  } catch (error) {
    console.error("Error updating project:", error);
    reply.status(500).send({ message: "Error updating project." });
  }
};
const deleteProject = async (req, reply) => {
  try {
    const db = getDB();
    await db
      .collection("projectTable")
      .updateOne(
        { _id: getObjectId(req.params.id) },
        { $set: { deleted: true } }
      );
    reply.send({ success: true, message: "Project soft deleted." });
  } catch (error) {
    console.error("Error deleting project:", error);
    reply.status(500).send({ message: "Error deleting project." });
  }
};

// Involvements CRUD
const addInvolvement = async (req, reply) => {
  try {
    const db = getDB();
    const result = await db.collection("involvementTable").insertOne(req.body);
    reply.send({
      success: true,
      message: "Involvement added.",
      newItem: { ...req.body, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error adding involvement:", error);
    reply.status(500).send({ message: "Error adding involvement." });
  }
};
const updateInvolvement = async (req, reply) => {
  try {
    const db = getDB();
    const { _id, ...updateData } = req.body;
    await db
      .collection("involvementTable")
      .updateOne({ _id: getObjectId(req.params.id) }, { $set: updateData });
    reply.send({ success: true, message: "Involvement updated." });
  } catch (error) {
    console.error("Error updating involvement:", error);
    reply.status(500).send({ message: "Error updating involvement." });
  }
};
const deleteInvolvement = async (req, reply) => {
  try {
    const db = getDB();
    await db
      .collection("involvementTable")
      .updateOne(
        { _id: getObjectId(req.params.id) },
        { $set: { deleted: true } }
      );
    reply.send({ success: true, message: "Involvement soft deleted." });
  } catch (error) {
    console.error("Error deleting involvement:", error);
    reply.status(500).send({ message: "Error deleting involvement." });
  }
};

// Experiences CRUD
const addExperience = async (req, reply) => {
  try {
    const db = getDB();
    const result = await db.collection("experienceTable").insertOne(req.body);
    reply.send({
      success: true,
      message: "Experience added.",
      newItem: { ...req.body, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error adding experience:", error);
    reply.status(500).send({ message: "Error adding experience." });
  }
};
const updateExperience = async (req, reply) => {
  try {
    const db = getDB();
    const { _id, ...updateData } = req.body;
    await db
      .collection("experienceTable")
      .updateOne({ _id: getObjectId(req.params.id) }, { $set: updateData });
    reply.send({ success: true, message: "Experience updated." });
  } catch (error) {
    console.error("Error updating experience:", error);
    reply.status(500).send({ message: "Error updating experience." });
  }
};
const deleteExperience = async (req, reply) => {
  try {
    const db = getDB();
    await db
      .collection("experienceTable")
      .updateOne(
        { _id: getObjectId(req.params.id) },
        { $set: { deleted: true } }
      );
    reply.send({ success: true, message: "Experience soft deleted." });
  } catch (error) {
    console.error("Error deleting experience:", error);
    reply.status(500).send({ message: "Error deleting experience." });
  }
};

// Year In Reviews CRUD
const addYearInReview = async (req, reply) => {
  try {
    const db = getDB();
    const result = await db.collection("yearInReviewTable").insertOne(req.body);
    reply.send({
      success: true,
      message: "YearInReview added.",
      newItem: { ...req.body, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error adding year-in-review:", error);
    reply.status(500).send({ message: "Error adding year-in-review." });
  }
};
const updateYearInReview = async (req, reply) => {
  try {
    const db = getDB();
    const { _id, ...updateData } = req.body;
    await db
      .collection("yearInReviewTable")
      .updateOne({ _id: getObjectId(req.params.id) }, { $set: updateData });
    reply.send({ success: true, message: "YearInReview updated." });
  } catch (error) {
    console.error("Error updating year-in-review:", error);
    reply.status(500).send({ message: "Error updating year-in-review." });
  }
};
const deleteYearInReview = async (req, reply) => {
  try {
    const db = getDB();
    await db
      .collection("yearInReviewTable")
      .updateOne(
        { _id: getObjectId(req.params.id) },
        { $set: { deleted: true } }
      );
    reply.send({ success: true, message: "YearInReview soft deleted." });
  } catch (error) {
    console.error("Error deleting year-in-review:", error);
    reply.status(500).send({ message: "Error deleting year-in-review." });
  }
};

// Honors Experiences CRUD
const addHonorsExperience = async (req, reply) => {
  try {
    const db = getDB();
    const result = await db
      .collection("honorsExperienceTable")
      .insertOne(req.body);
    reply.send({
      success: true,
      message: "HonorsExperience added.",
      newItem: { ...req.body, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error adding honors experience:", error);
    reply.status(500).send({ message: "Error adding honors experience." });
  }
};
const updateHonorsExperience = async (req, reply) => {
  try {
    const db = getDB();
    const { _id, ...updateData } = req.body;
    await db
      .collection("honorsExperienceTable")
      .updateOne({ _id: getObjectId(req.params.id) }, { $set: updateData });
    reply.send({ success: true, message: "HonorsExperience updated." });
  } catch (error) {
    console.error("Error updating honors experience:", error);
    reply.status(500).send({ message: "Error updating honors experience." });
  }
};
const deleteHonorsExperience = async (req, reply) => {
  try {
    const db = getDB();
    await db
      .collection("honorsExperienceTable")
      .updateOne(
        { _id: getObjectId(req.params.id) },
        { $set: { deleted: true } }
      );
    reply.send({ success: true, message: "HonorsExperience soft deleted." });
  } catch (error) {
    console.error("Error deleting honors experience:", error);
    reply.status(500).send({ message: "Error deleting honors experience." });
  }
};

// Skills Collection CRUD
const addSkill = async (req, reply) => {
  try {
    const db = getDB();
    const result = await db.collection("skillsCollection").insertOne(req.body);
    reply.send({
      success: true,
      message: "Skill added.",
      newItem: { ...req.body, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error adding skill:", error);
    reply.status(500).send({ message: "Error adding skill." });
  }
};
const updateSkill = async (req, reply) => {
  try {
    const db = getDB();
    const { _id, ...updateData } = req.body;
    await db
      .collection("skillsCollection")
      .updateOne({ _id: getObjectId(req.params.id) }, { $set: updateData });
    reply.send({ success: true, message: "Skill updated." });
  } catch (error) {
    console.error("Error updating skill:", error);
    reply.status(500).send({ message: "Error updating skill." });
  }
};
const deleteSkill = async (req, reply) => {
  try {
    const db = getDB();
    await db
      .collection("skillsCollection")
      .updateOne(
        { _id: getObjectId(req.params.id) },
        { $set: { deleted: true } }
      );
    reply.send({ success: true, message: "Skill soft deleted." });
  } catch (error) {
    console.error("Error deleting skill:", error);
    reply.status(500).send({ message: "Error deleting skill." });
  }
};

// Skills Table (Skill Components) CRUD
const addSkillComponent = async (req, reply) => {
  try {
    const db = getDB();
    const result = await db.collection("skillsTable").insertOne(req.body);
    reply.send({
      success: true,
      message: "SkillComponent added.",
      newItem: { ...req.body, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error adding skill component:", error);
    reply.status(500).send({ message: "Error adding skill component." });
  }
};
const updateSkillComponent = async (req, reply) => {
  try {
    const db = getDB();
    const { _id, ...updateData } = req.body;
    await db
      .collection("skillsTable")
      .updateOne({ _id: getObjectId(req.params.id) }, { $set: updateData });
    reply.send({ success: true, message: "SkillComponent updated." });
  } catch (error) {
    console.error("Error updating skill component:", error);
    reply.status(500).send({ message: "Error updating skill component." });
  }
};
const deleteSkillComponent = async (req, reply) => {
  try {
    const db = getDB();
    await db
      .collection("skillsTable")
      .updateOne(
        { _id: getObjectId(req.params.id) },
        { $set: { deleted: true } }
      );
    reply.send({ success: true, message: "SkillComponent soft deleted." });
  } catch (error) {
    console.error("Error deleting skill component:", error);
    reply.status(500).send({ message: "Error deleting skill component." });
  }
};

const getFeeds = async (req, reply) => {
  try {
    const db = getDB();
    const feeds = await db
      .collection("FeedTable")
      .find({ deleted: { $ne: true } })
      .sort({ feedCreatedAt: -1 })
      .toArray();
    reply.send(feeds);
  } catch (error) {
    console.error("Error fetching feeds:", error);
    reply.status(500).send({ message: "Error fetching feeds", error });
  }
};

const addFeed = async (req, reply) => {
  const { feedTitle, feedCategory, feedContent, feedImageURL, feedLinks } =
    req.body;
  if (!feedTitle || !feedCategory) {
    return reply
      .status(400)
      .send({ message: "feedTitle and feedCategory are required." });
  }
  try {
    const db = getDB();
    const newFeed = {
      feedTitle,
      feedCategory,
      feedContent: feedContent || [],
      feedImageURL: feedImageURL || null,
      feedLinks: feedLinks || [],
      feedCreatedAt: new Date().toISOString(),
    };
    const result = await db.collection("FeedTable").insertOne(newFeed);
    reply.send({
      success: true,
      message: "Feed added successfully.",
      newItem: { ...newFeed, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error adding feed:", error);
    reply.status(500).send({ message: "Error adding feed", error });
  }
};

const deleteFeed = async (req, reply) => {
  try {
    const db = getDB();
    const id = req.params.id;
    await db
      .collection("FeedTable")
      .updateOne({ _id: getObjectId(id) }, { $set: { deleted: true } });
    reply.send({ success: true, message: "Feed soft deleted." });
  } catch (error) {
    console.error("Error deleting feed:", error);
    reply.status(500).send({ message: "Error deleting feed", error });
  }
};

const editFeed = async (req, reply) => {
  try {
    const db = getDB();
    const id = req.params.id;
    const { _id, ...updateData } = req.body;
    await db
      .collection("FeedTable")
      .updateOne({ _id: getObjectId(id) }, { $set: updateData });
    reply.send({ success: true, message: "Feed updated." });
  } catch (error) {
    console.error("Error editing feed:", error);
    reply.status(500).send({ message: "Error editing feed", error });
  }
};

// Likes Implementation:
const typeMapping = {
  Feed: { collection: "FeedTable", titleField: "feedTitle" },
  YearInReview: {
    collection: "yearInReviewTable",
    titleField: "yearInReviewTitle",
  },
  Project: { collection: "projectTable", titleField: "projectTitle" },
  Involvement: {
    collection: "involvementTable",
    titleField: "involvementTitle",
  },
  HonorsExperience: {
    collection: "honorsExperienceTable",
    titleField: "honorsExperienceTitle",
  },
  Experience: { collection: "experienceTable", titleField: "experienceTitle" },
};

const addLike = async (req, reply) => {
  const { type, title } = req.body;
  if (!type || !title) {
    return reply
      .status(400)
      .send({ message: "Both 'type' and 'title' are required." });
  }
  const mapping = typeMapping[type];
  if (!mapping) {
    return reply.status(400).send({ message: "Invalid type provided." });
  }
  try {
    const db = getDB();
    const filter = { [mapping.titleField]: title, deleted: { $ne: true } };
    const update = { $inc: { likesCount: 1 } };
    const result = await db
      .collection(mapping.collection)
      .updateOne(filter, update);
    if (result.modifiedCount === 0) {
      return reply
        .status(404)
        .send({ message: "Document not found or cannot be updated." });
    }
    reply.send({ success: true, message: "Like added successfully." });
  } catch (error) {
    console.error("Error in addLike:", error);
    reply.status(500).send({ message: "Server error while adding like." });
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
  addLike,
};
