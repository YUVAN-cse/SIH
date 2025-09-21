import express from "express";
import {
  registerAdmin,
  loginAdmin,
  refreshToken,
  logoutAdmin,
  getAllAdmins,
  updateAdminRole,
} from "../controllers/admin.controller.js";

import { isAuthenticated } from "../middlewares/authMiddleware.js"; // verifies JWT
import { isAdmin }  from "../middlewares/authMiddleware.js"; // checks role
import {isSuperAdmin} from "../middlewares/authMiddleware.js"; // checks role


const router = express.Router();

//  Auth routes
router.post("/register", registerAdmin); // public (superadmin can later restrict this)
router.post("/login", loginAdmin);
router.post("/refresh-token", refreshToken);
router.post("/logout", isAuthenticated,  logoutAdmin);

//  Admin management (superadmin only)
router.get("/", isAuthenticated, isSuperAdmin, getAllAdmins);
router.put("/update-role", isAuthenticated, isSuperAdmin, updateAdminRole);

export default router;
