import express from "express";
import {
    applyAdmission,
    verifyDocument,
    makePayment,
    getAdmissionDetails,
    verificationFromAI
} from "../controllers/admission.controller.js";

const router = express.Router();

// Apply
router.post("/apply", applyAdmission);

router.post("/verify", verificationFromAI);

// Verify document
router.patch("/:id/verify", verifyDocument);


// Payment
router.post("/:id/payment", makePayment);

// Get details
router.get("/:id", getAdmissionDetails);

export default router;
