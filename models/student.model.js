// models/Student.js

import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  studentId: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  regNo: { type: String, required: true, unique: true },
  mobile: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  attendanceInfo: { type: Array, default: [] },
  courseDetails: { type: Array, default: [] },
  feeStatus: { type: String, default: "Unpaid" },
  complaintPortal: { type: Array, default: [] },
  examHistory: { type: Array, default: [] },  
},{
  timestamps: true,});

const Student = mongoose.model("Student", studentSchema);

export default Student;
