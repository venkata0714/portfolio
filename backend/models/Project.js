const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  projectTitle: String,
  projectLink: String,
  projectImages: Array,
  projectSubTitle: String,
  projectTimeline: String,
  projectTagline: String,
  projectParagraphs: Array,
  projectURLs: Array
});

module.exports = mongoose.model('projectTable', projectSchema);
