// models/Student.js

import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: null },
  hasHostel: { type: Boolean, default: false },
  attendanceInfo: { type: Object, default: {} },
  feeStatus: { type: Object, default: {} },
  complaintPortal: { type: Object, default: {} },
  examHistory: { type: Object, default: {} },
  results: { type: Object, default: {} },
  timetable: { type: Object, default: {} },
  library: { type: Object, default: {} },
  hostel: { type: Object, default: {} },
  
  courseDetails: { type: Object, default: {} },
  others: { type: Object, default: {} },

  createdAt: { type: Date, default: Date.now },
});

const Student = mongoose.model("Student", studentSchema);

export default Student;
