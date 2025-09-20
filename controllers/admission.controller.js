import Admission from "../models/admission.model.js";

// 1. Apply for Admission
export const applyAdmission = async (req, res) => {
  try {
    const admission = new Admission(req.body);
    await admission.save();
    res.status(201).json({ success: true, admission });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// 2. Verify Document (Staff)
export const verifyDocument = async (req, res) => {
  try {
    const { docType, verified } = req.body; // e.g. docType = "marksCard"
    const admission = await Admission.findById(req.params.id);
    if (!admission) return res.status(404).json({ success: false, message: "Admission not found" });

    if (admission.documents[docType]) {
      admission.documents[docType].verified = verified;
      await admission.save();
      return res.json({ success: true, admission });
    } else {
      return res.status(400).json({ success: false, message: "Invalid document type" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. Update Admission Status
export const updateAdmissionStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const admission = await Admission.findByIdAndUpdate(
      req.params.id,
      { admissionStatus: status, staffRemarks: remarks },
      { new: true }
    );
    if (!admission) return res.status(404).json({ success: false, message: "Admission not found" });
    res.json({ success: true, admission });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
