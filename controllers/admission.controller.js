import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

import { Admission } from "../models/admission.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import Temp from "../models/temp.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { compareData } from "../utils/AI.utils.js";
import sample from "../utils/digilocker.sample.js";
import digilockerSample from "../utils/digilocker.sample.js";
import Student from "../models/student.model.js";
import Hostel from "../models/hostel.model.js";
import Fee from "../models/fee.model.js";
import { nanoid } from "nanoid";
import Stripe from "stripe";
import { validate } from "node-cron";
import { detectTextFromImageUri } from "../utils/OCRLogic.js";
import mongoose from "mongoose";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const applyAdmission = async (req, res) => {
  try {
   console.log("req.body:", req.body);
console.log("req.file:", req.file);
console.log("req.files:", req.files);
    if (!req.body) {
      return res.status(400).json(new ApiError(400, "All fields are required"));
    }

    if (!req.files) {
    return  res.status(400).json(new ApiError(400, "All fields are required"));
    }

    let markscardURL = await uploadOnCloudinary(req.files.marksCard[0].path);
    let idProofURL = await uploadOnCloudinary(req.files.idProof[0].path);
    let photoURL = await uploadOnCloudinary(req.files.photo[0].path);

    console.log(markscardURL.secure_url, idProofURL.secure_url, photoURL.secure_url);


    let documents = {};

    documents.marksCard = {
      url: markscardURL.secure_url,
      verified: false,
    };

    documents.idProof = {
      url: idProofURL.secure_url,
      verified: false,
    };

    documents.photo = {
      url: photoURL.secure_url,
    };

    req.body.documents = documents;
    const admission = await Admission.create(req.body);

    if (!admission) {
      res.status(400).json(new ApiError(400, "Admission Failed"));
    }


    let tempSudentDetail = await Temp.insertOne({
      name: req.body.name,
      email: req.body.email,
      password: req.body.mobile,
      mobile: req.body.mobile,
      status: "draft",
    });

    await tempSudentDetail.save();

    let accessToken = tempSudentDetail.generateAccessToken();

    let student = Temp.findOne({ email: req.body.email })

    admission.admissionStatus = "applied";

    await admission.save({ validateBeforeSave: false });

    console.log(admission);
    res.status(201)
      .cookie("accessToken", accessToken, { httpOnly: true })
      .json(new ApiResponse(true, admission));
  } catch (err) {
    res.status(400).json(new ApiError(400, err.message));
  }
}

export const verificationFromAI = async (req, res) => {
  try {

    const user = req.user.id

    const admission = await Admission.findOne({ studentId: user._id });

    if (!admission) {
      return res.status(404).json(new ApiError(404, "Admission not found"));
    }

    let documents = admission.documents;

    const idProof = await detectTextFromImageUri(documents.idProof.url);
    const marksCard = await detectTextFromImageUri(documents.marksCard.url);

    let result1 = await compareData(marksCard, digilockerSample.doc);
    let result2 = await compareData(idProof, digilockerSample.idProof);
    let result3 = await compareData(digilockerSample.idProof, digilockerSample.idProof);

    console.log(result1, result2, result3);

    if (result1 && result2) {
      console.log("Verified");
      admission.documents.marksCard.badget = result1;
      admission.documents.idProof.badget = result2;
      admission.admissionStatus = "under_review"
      await admission.save();
    }

    res.status(200).json(new ApiResponse(true, { result1, result2 }));

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
    const { hostelId, roomId } = req.params;
    const studentId = req.user.id;
    const studentEmail = req.user.email;

    const hostel = await Hostel.findOne({ hostelId });
    if (!hostel) return res.status(404).json(new ApiError(404, "Hostel not found"));
    
    const admission = await Admission.findOne({ email: studentEmail });
    console.log(admission);
    if (!admission) return res.status(404).json(new ApiError(404, "Admission not found"));
    if (admission.admissionStatus !== "verified") {
      return res.status(400).json(new ApiError(400, "Admission not verified"));
    }

    // Find the room inside blocks → floors → rooms
    let roomFound = null;
    for (const block of hostel.blocks) {
      for (const floor of block.floors) {
        const room = floor.rooms.find(r => r.roomId === roomId);
        if (room) {
          roomFound = room;
          break;
        }
      }
      if (roomFound) break;
    }

    if (!roomFound) return res.status(404).json(new ApiError(404, "Room not found"));

    // Check if room is available


    if (
      roomFound.capacity <= roomFound.bookedBy.length ||
      roomFound.capacity === 0 ||
      roomFound.bookedBy.includes(studentId) ||
      roomFound.occupiedBy.includes(studentId) ||
      roomFound.status !== "active" ||
      roomFound.capacity <= roomFound.occupiedBy.length
    ) {
      return res.status(400).json(new ApiError(400, "Room not available"));
    }


    // Book room

    admission.feesToBePaid += roomFound.pricePerStudent;
    roomFound.bookedBy.push(studentId);
    admission.bookedRoom = roomFound;
    admission.bookedRoomInWhichHostel =new mongoose.Types.ObjectId(hostel._id);

    await hostel.save();
    await admission.save();

    res.status(200).json(new ApiResponse(200, admission));
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
};

// 4. Payment
export const makePaymentForAdmission = async (req, res) => {
  try {

    const student = req.user.id;
    const email = req.user.email;

    const admission = await Admission.findOne({ email });
    console.log(admission);
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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: admission.name,
              images: [admission.documents.photo.url],
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URI}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URI}/payment/cancel`,
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
      let admission = await Admission.findOne({ email: req.user.email });
      if (!admission) {
        return res.status(404).json(new ApiError(404, "Admission not found"));
      }

      if (admission.bookedRoom !== null || admission.bookedRoomInWhichHostel !== null) {
        admission.confirmedRoom = admission.bookedRoom;
        admission.bookedRoom = null;
      }
      // Update admission payment details
      admission.payment.status = "success";
      admission.payment.amountPaid = session.amount_total / 100;
      admission.payment.transactionId = session.payment_intent || "txn_mock";
      admission.payment.date = Date.now();
      admission.payment.mode = "online";
      admission.feesToBePaid = 0;
      await admission.save();

      // Get booked room info
      const { bookedRoom, bookedRoomInWhichHostel } = admission;

      // Find hostel containing this room
      const hostel = await Hostel.findOne({ hostelId: bookedRoomInWhichHostel });
      if (!hostel) {
        return res.status(404).json(new ApiError(404, "Hostel not found"));
      }

      let foundRoom = null;
      hostel.blocks.forEach(block => {
        block.floors.forEach(floor => {
          floor.rooms.forEach(room => {
            if (room.roomId === bookedRoom) {
              // Update occupants
              if (!room.occupiedBy.includes(req.user._id)) {
                room.occupiedBy.push(req.user.id);
              }
              room.bookedBy = room.bookedBy.filter(
                id => id.toString() !== req.user.id.toString()
              );
              foundRoom = room;
            }
          });
        });
      });

      if (!foundRoom) {
        return res.status(404).json(new ApiError(404, "Room not found"));
      }

      // Save hostel with updated room data
      await hostel.save();

      res
        .status(200)
        .json(
          new ApiResponse(200, { admission, room: foundRoom }, "Payment successful")
        );
    } else {
      return res.status(400).json(new ApiError(400, "Payment failed"));
    }
  } catch (err) {
    res.status(500).json(new ApiError(500, err.message));
  }
};

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
    res.status(200).json(new ApiResponse(200, { admission, fee, room }, "Payment successful"));
  } catch (err) {
    res.status(500).json(new ApiError(500, err.message));
  }
}

export const studentCredentialsGeneration = async (req, res) => {
  try {
    const admission = await Admission.findOne({ email: req.user.email });
    console.log("admission", admission)
    if (!admission) return res.status(404).json({ success: false, message: "Admission not found" });

    const tempStudent = await Temp.findOne({ name: admission.name });

    console.log(tempStudent);

    let student = await Student.create({
      studentId: req.user.id,
      name: tempStudent.name,
      email: tempStudent.email,
      password: tempStudent.mobile,
      profileImage: admission.documents.photo.url,
      hasHostel: admission.confirmedRoom ? true : false,
      mobile: tempStudent.mobile,
      feeStatus: admission.feesToBePaid === 0 ? "Paid" : "Unpaid",
      courseDetails: [admission.courseDetails],
      receiptNo: admission.payment.status === "paid" ? admission.payment.transactionId : nanoid(),
    });

    admission.credentialsGenerated = true;
    await admission.save();

    await Temp.deleteOne({ name: admission.name });

    // Create fee record
    const fee = await Fee.create({
      studentId: req.user.id,
      hostelId: bookedRoomInWhichHostel,
      roomId: bookedRoom,
      type: "tuition",
      status: "paid",
      amount : admission.feesToBePaid,
      paidAmount : admission.payment.amountPaid,
      pendingAmount : admission.feesToBePaid - admission.payment.amountPaid
    });

    res.status(200).json(new ApiResponse(200, { student, fee }, "Credentials generated successfully"));
  } catch (err) {
    res.status(500).json(new ApiError(500, err.message));
  }
}

// 5. Get Admission Details
export const getAdmissionDetails = async (req, res) => {
  try {
    const admission = await Admission.findOne(req.body.email);
    const student = await Student.findOne({ email: req.body.email });
    if (!admission) return res.status(404).json({ success: false, message: "Admission not found" });
    res.json(new ApiResponse(200, { admission, student }, "Admission details fetched successfully"));
  } catch (err) {
    res.status(500).json(new ApiError(500, err.message));
  }
};




