// controllers/StudentController.js

import Student from "../models/student.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register a new student
export const registerStudent = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingStudent = await Student.findOne({ email });
    if (existingStudent)
      return res.status(400).json({ message: "Student already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const newStudent = new Student({
      name,
      email,
      password: hashedPassword,
    });

    await newStudent.save();
    res.status(201).json({ message: "Student registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Login a student
export const loginStudent = async (req, res) => {
  const { email, password } = req.body;

  try {
    const student = await Student.findOne({ email });
    if (!student) return res.status(400).json({ message: "Student not found" });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: student._id }, "your_jwt_secret", {
      expiresIn: "1h",
    });

    res.status(200).json({ token, student });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get student dashboard
export const getStudentDashboard = async (req, res) => {
  const studentId = req.studentId;

  try {
    const student = await Student.findById(studentId);
    if (!student) return res.status(400).json({ message: "Student not found" });

    res.status(200).json({
      attendanceInfo: student.attendanceInfo,
      courseDetails: student.courseDetails,
      feeStatus: student.feeStatus,
      complaintPortal: student.complaintPortal,
      examHistory: student.examHistory,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
