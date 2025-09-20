// routes/studentRoutes.js

import express from "express";
const router = express.Router();
import {
  registerStudent,
  loginStudent,
} from "../controllers/student.controller.js";

const authMiddleware = require("../middlewares/authMiddleware"); // middleware for checking JWT token

// Register a new student
router.post("/register", registerStudent);

// Login a student
router.post("/login", loginStudent);

// Get student dashboard (protected route)
router.get("/dashboard", authMiddleware, getStudentDashboard);

module.exports = router;
