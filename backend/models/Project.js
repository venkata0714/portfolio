// backend/models/Project.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  projectTitle: String,
  projectLink: String,
  projectImages: [String],
  projectSubTitle: String,
  projectTimeline: String,
  projectTagline: String,
  projectParagraphs: [String],
  projectURLs: [String]
},
{ 
  collection: 'projectTable'
});

module.exports = mongoose.model('projectTable', projectSchema);
