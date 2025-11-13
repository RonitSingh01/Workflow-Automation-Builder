// src/models/Workflow.js
const mongoose = require('mongoose');

const WorkflowSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  definition: { type: mongoose.Schema.Types.Mixed, required: true }, // store React Flow JSON
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

WorkflowSchema.pre('save', function(next){
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.models.Workflow || mongoose.model('Workflow', WorkflowSchema);
