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
import upload from "../middlewares/multer.config.js";

const router = express.Router();

router.post("/apply-admission", upload.fields([
    { name: 'marksCard', maxCount: 1 },
    { name: 'idProof', maxCount: 1 },
    { name: 'photo', maxCount: 1 }
]) ,  applyAdmission);
router.post("/verify-document-ai", verifyJWT, verificationFromAI);
router.post("/verify-document/:id", verifyDocument);
router.get("/get-all-hostels", getAllHostelsInfo);
router.post("/book-hostel-room/hostel/:hostelId/room/:roomId",verifyJWT, bookHostelRoom);
router.post("/make-payment",verifyJWT, makePaymentForAdmission);
router.post("/online-payment-success",verifyJWT, onlinePaymentSuccess);
router.post("/student-credentials-generation",verifyJWT, studentCredentialsGeneration);



router.get("/download-receipt/:id",verifyJWT, downloadReceiptForAdmissionFeePayment);

//for staff future restriction will be added
router.get("/admission-details/:id", getAdmissionDetails);




router.post("/offline-payment-success", offlinePaymentSuccess);

export default router;
