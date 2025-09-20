import express from "express";
import {
  adminLogin,
  facultyLogin,
  roleBasedLogin,
  studentLogin,
} from "../controllers/rolebasedlogin.controller.js";

const router = express.Router();

//role-based login route
router.post("/role-login", roleBasedLogin);

//student login route
router.post("/student-login", studentLogin);

//admin login route
router.post("/admin-login", adminLogin);

//faculty login route
router.post("/faculty-login", facultyLogin);

export default router;
