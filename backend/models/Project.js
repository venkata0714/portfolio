const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectLink: String,
  projectImages: [String],
  projectTitle: String,
  projectSubTitle: String,
  projectTimeline: String,
  projectTagline: String,
  projectParagraphs: [String],
  projectURLs: [String]
});

module.exports = mongoose.model('Project', projectSchema);
