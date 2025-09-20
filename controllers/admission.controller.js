
import { Admission } from "../models/admission.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import temp from "../models/temp.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { compareJsonObjects } from "../utils/AI.utils.js";
import sample from "../utils/digilocker.sample.js";
import digilockerSample from "../utils/digilocker.sample.js";
import Student from "../models/student.model.js";
import Hostel from "../models/hostel.model.js";
import Fee from "../models/fee.model.js";
import nanoid from "nanoid";

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

    let student = temp.findOne({ email: req.body.email })

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

    const admission = await Admission.findOne({ studentId: user._id });

    if (!admission) {
      return res.status(404).json(new ApiError(404, "Admission not found"));
    }

    let documents = admission.documents;

    const idProof = await detectTextFromImageUri(documents.idProof.url);
    const marksCard = await detectTextFromImageUri(documents.marksCard.url);


    let result1 = compareJsonObjects(marksCard, digilockerSample.doc);
    let result2 = compareJsonObjects(marksCard, digilockerSample.idProof);

    if (result1.status && result2.status) {
      admission.documents.marksCard.badget = result1;
      admission.documents.idProof.badget = result2;
      admission.admissionStatus = "under_review"
      await admission.save();
    }

    res.status(200).json(new ApiResponse(true, { idProof, marksCard }));

  } catch (err) {
    res.status(500).json(new ApiError(500, err.message));
  }
};

// 2. Verify Document (Staff)
export const verifyDocument = async (req, res) => {
  try {
    const { docType, verification, remarks } = req.body; // e.g. docType = "marksCard"
    const admission = await Admission.findById(req.params.id);
    if (!admission) {
      return res.status(400).json(new ApiError(400, "failed to get the admission doc"))
    }

    if (admission.documents[docType]) {
      admission.documents[docType].verified = verification;
      admission.staffRemarks = req.body?.remarks || null;
      if (!remarks) {
        admission.admissionStatus = "verified"
      } else {
        admission.admissionStatus = "rejected"
      }
      await admission.save();
      return res.status(200).json(new ApiResponse(200, admission, "successfully done"));
    } else {
      return res.status(404).json(new ApiError(404, "Document not found"));
    }
  } catch (err) {
    res.status(500).json(new ApiError(500, err.message));
  }
};

export const getAllHostelsInfo = async (req, res) => {
  try {
    const hostels = await Hostel.find();
    if (!hostels) {
      return res.status(404).json(new ApiError(404, "Hostels not found"));
    }
    res.status(200).json(new ApiResponse(200, hostels));
  } catch (err) {
    res.status(500).json(new ApiError(500, err.message));
  }
}

export const bookHostelRoom = async (req, res) => {
  try {
    let { hostelId, roomId } = req.params;
    const room = await HostelRoom.findOne({ roomId: roomId, hostelId: hostelId });
    if (!room) {
      return res.status(404).json(new ApiError(404, "Room not found"));
    }
    let student = req.user._id;
    const admission = await Admission.findOne({ studentId: student });

    if (!admission) {
      return res.status(404).json(new ApiError(404, "Admission not found"));
    }

    if (admission.admissionStatus !== "verified") {
      return res.status(400).json(new ApiError(400, "Admission not verified"));
    }

    if (room.capacity <= room.bookedBy.length || room.capacity === 0 || room.bookedBy.includes(student) || room.status !== "active" || room.capacity <= room.occupiedBy.length) {
      return res.status(400).json(new ApiError(400, "Room not available"));
    }

    room.bookedBy.push(student);
    admission.bookedRoom = room;

    await admission.save();
    res.status(200).json(new ApiResponse(200, admission));
  } catch (error) {
    return res.status(500).json(new ApiError(500, err.message));
  }
}

// 4. Payment
export const makePaymentForAdmission = async (req, res) => {
  try {

    const student = req.user._id;

    const admission = await Admission.findOne({ studentId: student });
    if (!admission) {
      return res.status(404).json(new ApiError(404, "Admission not found"));
    }

    if (admission.admissionStatus !== "verified") {
      return res.status(400).json(new ApiError(400, "Admission not verified"));
    }

    if (admission.payment.status !== "pending") {
      return res.status(400).json(new ApiError(400, "Payment already done"));
    }

    let amount = admission.feesToBePaid - admission.payment.amountPaid;

    if (!isNull(admission.bookedRoom)) {
      //flag red
      const bookedBy = req.user._id; // assume you pass studentId or tempId here

      // Find the hostel containing the booked student
      const hostel = await Hostel.findOne({ "blocks.floors.rooms.bookedBy": bookedBy });

      if (!hostel) {
        return res.status(404).json(new ApiError(404, "Hostel not found"));
      }

      // Traverse to find the actual room
      let foundRoom = null;
      hostel.blocks.forEach(block => {
        block.floors.forEach(floor => {
          floor.rooms.forEach(room => {
            if (room.bookedBy.some(id => id.toString() === bookedBy)) {
              foundRoom = room;
            }
          });
        });
      });

      if (!foundRoom) {
        return res.status(404).json(new ApiError(404, "Room not found for this student"));
      }

      amount += foundRoom.pricePerStudent

    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: student.name,
              images: [admission.documents.photo.url],
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
    })



    res.status(200).json(new ApiResponse(200, { url: session.url }))
  } catch (err) {
    res.status(500).json(new ApiError(500, err.message));
  }
};

export const onlinePaymentSuccess = async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);

    if (session.payment_status === "paid") {
      const admission = await Admission.findOne({ studentId: req.user._id });
      admission.payment.status = "paid";
      admission.payment.amountPaid = session.amount_total / 100;
      admission.payment.transactionId = session.payment_intent;
      admission.payment.date = Date.now();
      admission.payment.mode = "online";
      admission.feesToBePaid = 0;
      await admission.save();


      const room = admission.bookedRoom;
      room.occupiedBy.push(req.user._id);
      room.bookedBy = room.bookedBy.filter(id => id.toString() !== req.user._id.toString());
      await room.save();


      let student = req.user._id;

      let fee = Fee.create({
        studentId: student,
        hostelId: admission.bookedRoom,
        type: "tuition",
        status: "paid",
        amount: session.amount_total / 100,
        paidAmount: session.amount_total / 100,
      })

      await fee.save();

      res.status(200).json(new ApiResponse(200, {admission , fee , room} , "Payment successful"));
    }
    else{
      return res.status(400).json(new ApiError(400, "Payment failed"));
    }
  } catch (err) {
    res.status(500).json(new ApiError(500, err.message));
  }
}

export const offlinePaymentSuccess = async (req, res) => {
  try {
    const admission = await Admission.findOne({ studentId: req.params.id });
    admission.payment.status = "paid";
    admission.payment.amountPaid = req.body.amountPaid;
    admission.payment.transactionId = req.body.transactionId;
    admission.payment.date = Date.now();
    admission.payment.mode = "offline";
    admission.feesToBePaid = admission.feesToBePaid - req.body.amountPaid;
    await admission.save();

    const room = admission.bookedRoom;
    room.occupiedBy.push(req.user._id);
    room.bookedBy = room.bookedBy.filter(id => id.toString() !== req.user._id.toString());
    await room.save();

    let fee = Fee.create({
      studentId: admission.studentId,
      hostelId: admission.bookedRoom,
      type: "tuition",
      status: "paid",
      amount: req.body.totalAmount,
      paidAmount: req.body.amountPaid,
    })
    res.status(200).json(new ApiResponse(200, { admission , fee , room } , "Payment successful"));
  } catch (err) {
    res.status(500).json(new ApiError(500, err.message));
  }
}

export const studentCredentialsGeneration = async (req, res) => {
  try {
    const admission = await Admission.findOne({ studentId: req.user._id });
    if (!admission) return res.status(404).json({ success: false, message: "Admission not found" });
    
    const tempStudent = temp.findOne({ name: admission.fullName });
    let student = await Student.create({
      studentId: nanoid(),
      name:tempStudent.name,
      email:tempStudent.email,
      password:tempStudent.mobile,
      mobile:tempStudent.mobile,
      feeStatus:admission.feesToBePaid === 0 ? "Paid" : "Unpaid",
      courseDetails:[admission.courseDetails],
    });
    
    admission.credentialsGenerated = true;
    await admission.save();

    await temp.deleteOne({ name: admission.fullName });

    res.status(200).json(new ApiResponse(200, student , "Credentials generated successfully"));
  } catch (err) {
    res.status(500).json(new ApiError(500, err.message));
  }
}


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


