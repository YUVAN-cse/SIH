import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  studentId: { type: String, unique: true, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  profileImage: { type: String, default: null },
  hasHostel: { type: Boolean, default: false },

  role: {
    type: String,
    enum: ["student"],
    default: "student",
  },

  mobile: { type: Number },

  // ✅ Relations (Refs)
  attendanceInfo: [{ type: mongoose.Schema.Types.ObjectId, ref: "Attendance" }],
  feeStatus: [{ type: mongoose.Schema.Types.ObjectId, ref: "Fee" }],
  complaintPortal: [{ type: mongoose.Schema.Types.ObjectId, ref: "Complaint" }],
  examHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Exam" }],
  results: [{ type: mongoose.Schema.Types.ObjectId, ref: "Result" }],
  timetable: [{ type: mongoose.Schema.Types.ObjectId, ref: "Timetable" }],
  library: [{ type: mongoose.Schema.Types.ObjectId, ref: "Library" }],
  hostel: { type: mongoose.Schema.Types.ObjectId, ref: "Hostel" },
  courseDetails: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  others: [{ type: mongoose.Schema.Types.ObjectId, ref: "Other" }],

  createdAt: { type: Date, default: Date.now },
});

// 🔒 Hash password before saving
studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ✅ Compare entered password
studentSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 🎟️ Generate JWT Access Token
studentSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, studentId: this.studentId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

const Student = mongoose.model("Student", studentSchema);

export default Student;
