import express from "express";
import {
    applyAdmission,
    verifyDocument,
    updateAdmissionStatus,
    makePayment,
    getAdmissionDetails,
} from "../controllers/admission.controller.js";

const router = express.Router();

// Apply
router.post("/apply", applyAdmission);

// Verify document
router.patch("/:id/verify", verifyDocument);

// Update status
router.patch("/:id/status", updateAdmissionStatus);

// Payment
router.post("/:id/payment", makePayment);

// Get details
router.get("/:id", getAdmissionDetails);

export default router;
