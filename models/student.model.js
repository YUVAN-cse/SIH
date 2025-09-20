// models/Student.js

import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  attendanceInfo: { type: Array, default: [] },
  courseDetails: { type: Array, default: [] },
  feeStatus: { type: String, default: "Unpaid" },
  complaintPortal: { type: Array, default: [] },
  examHistory: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now },
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
