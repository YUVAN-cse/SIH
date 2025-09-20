// routes/studentRoutes.js

import express from "express";
import {
  loginStudent,
  getStudentDashboard,
  getAttendanceInfo,
  getCourseDetails,
  getFeeStatus,
  getComplaintPortal,
  getExamHistory,
  getTimetable,
  getEvents,
  getLibrary,
  getHostel,
} from "../controllers/student.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js"; // middleware for checking JWT token

const router = express.Router();

// Login a student
router.post("/login", loginStudent);

router.use(authMiddleware); // Apply auth middleware to all routes below

// Get student dashboard (main dashboard view)
router.get("/dashboard", getStudentDashboard);

// Get specific dashboard sections
router.get("/attendance", getAttendanceInfo);
router.get("/courses", getCourseDetails);
router.get("/fees", getFeeStatus);
router.get("/complaints", getComplaintPortal);
router.get("/exam-history", getExamHistory);
router.get("/timetable", getTimetable);
router.get("/events", getEvents);
router.get("/library", getLibrary);
router.get("/hostel", getHostel); // Only accessible if student has hostel access

export default router;
