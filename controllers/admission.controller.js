import {Admission} from "../models/admission.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import temp from "../models/temp.model.js";
import  uploadOnCloudinary  from "../utils/cloudinary.js";
import {compareJsonObjects} from "../utils/AI.utils.js";
import sample from "../utils/digilocker.sample.js";
import digilockerSample from "../utils/digilocker.sample.js";

export const applyAdmission = async (req, res) => {
  try {
    if (!req.body) {
      res.status(400).json(new ApiError(400, "All fields are required"));
    }

    if (!req.files) {
      res.status(400).json(new ApiError(400, "All fields are required"));
    }

    let markscardURL = await uploadOnCloudinary(req.files.marksCard[0].path);
    let idProofURL = await uploadOnCloudinary(req.files.idProof[0].path);
    let photoURL = await uploadOnCloudinary(req.files.photo[0].path);

    req.body.documents["photo"] = photoURL;

    req.body.documents["idProof"] = idProofURL;
    req.body.documents["marksCard"] = markscardURL;


    const admission = new Admission(req.body);

    if (!admission) {
      res.status(400).json(new ApiError(400, "Admission Failed"));
    }

    const tempSudentDetail = await temp.create({
      name: req.body.fullName,
      email: req.body.email,
      password: req.body.phone,
      mobile: req.body.phone,
      status: "pending",
    })

    let accessToken = tempSudentDetail.generateAccessToken();

    let student = temp.findOne({email : req.body.email})

    admission.studentId = student._id;
    admission.admissionStatus = "applied";
    await admission.save();
    res.status(201)
    .cookie("accessToken", accessToken, { httpOnly: true })
    .json(new ApiResponse(true, admission));
  } catch (err) {
    res.status(400).json(new ApiError(400, err.message));
  }
}

export const verificationFromAI = async (req, res) => {
  try {
    const user = req.user._id

    const admission = await Admission.findOne({studentId:user._id});

    if(!admission){
      return res.status(404).json(new ApiError(404, "Admission not found"));
    }

    let documents = admission.documents;

    const idProof = await detectTextFromImageUri(documents.idProof.url);
    const marksCard = await detectTextFromImageUri(documents.marksCard.url);


    let result1 = compareJsonObjects(marksCard, digilockerSample.doc );
    let result2 = compareJsonObjects(marksCard, digilockerSample.idProof );

    if(result1.status && result2.status){
      admission.documents.marksCard.badget = result1;
      admission.documents.idProof.badget = result2;
      admission.admissionStatus = "under_review"
      await admission.save();
    }
  
    res.status(200).json(new ApiResponse(true, {idProof , marksCard}));

  } catch (err) {
    res.status(500).json(new ApiError(500, err.message));
  }
};

// 2. Verify Document (Staff)
export const verifyDocument = async (req, res) => {
  try {
    const { docType, verification , remarks } = req.body; // e.g. docType = "marksCard"
    const admission = await Admission.findById(req.params.id);
    if(!admission){
        return res.status(400).json(new ApiError(400 , "failed to get the admission doc"))
    }

    if (admission.documents[docType]) {
      admission.documents[docType].verified = verification;
      admission.staffRemarks = req.body?.remarks || null;
      admission.admissionStatus = "verified";
      await admission.save();
      return res.status(200).json(new ApiResponse(200, admission ,"successfully done"));
    } else {
      return res.status(404).json(new ApiError(404, "Document not found"));
    }
  } catch (err) {
    res.status(500).json(new ApiError(500, err.message));
  }
};



// 4. Payment
export const makePayment = async (req, res) => {
  try {
    const { transactionId, amount } = req.body;
    const admission = await Admission.findById(req.params.id);
    if (!admission) return res.status(404).json({ success: false, message: "Admission not found" });

    admission.payment = {
      transactionId,
      amount,
      status: "success",
      date: new Date(),
    };
    admission.admissionStatus = "payment_done";
    await admission.save();

    res.json({ success: true, admission });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 5. Get Admission Details
export const getAdmissionDetails = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id).populate("studentId");
    if (!admission) return res.status(404).json({ success: false, message: "Admission not found" });
    res.json({ success: true, admission });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
