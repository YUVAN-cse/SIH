import express from "express";
import {
    applyAdmission,
    verifyDocument,
    makePaymentForAdmission,
    getAdmissionDetails,
    verificationFromAI,
    getAllHostelsInfo,
    bookHostelRoom,
    onlinePaymentSuccess,
    offlinePaymentSuccess,
    studentCredentialsGeneration,
} from "../controllers/admission.controller.js";

import { downloadReceiptForAdmissionFeePayment } from "../controllers/pdf.controller.js";
import  {verifyJWT}  from "../middlewares/studentVerify.middleware.js";

const router = express.Router();

router.post("/apply-admission", applyAdmission);
router.post("/verify-document-ai", verifyJWT, verificationFromAI);
router.post("/verify-document", verifyDocument);
router.post("/make-payment",verifyJWT, makePaymentForAdmission);
router.get("/get-all-hostels", getAllHostelsInfo);
router.post("/book-hostel-room",verifyJWT, bookHostelRoom);
router.post("/online-payment-success",verifyJWT, onlinePaymentSuccess);
router.post("/student-credentials-generation",verifyJWT, studentCredentialsGeneration);
router.get("/download-receipt/:id",verifyJWT, downloadReceiptForAdmissionFeePayment);

//for staff future restriction will be added
router.get("/admission-details/:id", getAdmissionDetails);
router.post("/offline-payment-success", offlinePaymentSuccess);

export default router;
