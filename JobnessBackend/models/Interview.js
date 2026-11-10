const mongoose = require("mongoose");
const Company = require("./Company");

const InterviewSchema = new mongoose.Schema({
  interviewDate: {
    type: Date,
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: "Company",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Interview", InterviewSchema);
