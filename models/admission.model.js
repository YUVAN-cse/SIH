import mongoose from "mongoose";
import Temp from "./temp.model.js";
import Hostel from "./hostel.model.js";

const admissionSchema = new mongoose.Schema(
    {
    
        //  Basic student details
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, lowercase: true },
        mobile: { type: String, required: true },


        //  Previous academic info (flexible for board)
        previousEducation: {
            boardOrUniversity: { type: String }, // CBSE, VTU, BMSIT, Diploma Board etc
            rollNumber: { type: String },
            marksObtained: { type: Number },
            totalMarks: { type: Number },
            percentage: { type: Number },
            year: { type: Number }, // e.g. 2020
        },
        courseDetails: {
            courseName: {
                type: String,
                // required: true,
                trim: true,
            },
            courseCode: {
                type: String,
                // required: true,
                trim: true,
            }
        },
        //  Documents
        documents: {
            marksCard: {
                url: String, // Cloudinary URL
                verified: { type: Boolean, default: false },
                badget: {
                    type: String,
                    enum: ["suspicious", "not suspicious", "not checked"],
                },
            },
            idProof: {
                url: String,
                verified: { type: Boolean, default: false },
                badget: {
                    type: String,
                    enum: ["suspicious", "not suspicious", "not checked"],
                },
            },
            photo: { url: String },
        },

        /*
             marksCard
             url: where the uploaded file is stored (e.g., Cloudinary, S3).
             verified: set true after staff/doc-verification step (OCR check, QR validation, or manual).
             idProof
             Same as above, but for Aadhaar / Passport / Driving License.
             verified: ensures the ID is genuine.
             photo
             Just a profile photo for ID card / ERP dashboard.
             No verified needed (optional), but you can add it if you want staff to approve photos too.
        */


        //set by admin based on admission type like tuition fee for sc st etc
        feesToBePaid: {
            type: Number,
            required: true,
            default:22000,
        },

        //  Payment details
        payment: {
            transactionId: String,
            amountPaid: {
                type: Number,
                default: 0,
            },
            status: {
                type: String,
                enum: ["pending", "success", "failed"],
                default: "pending",
            },
            mode: {
                type: String,
                enum: ["online", "offline"],
                default: "online",
            },
            date: Date,
        },

        //  Admission status tracking
        admissionStatus: {
            type: String,
            enum: [
                "applied",       // student submitted application
                "under_review",  // staff verifying docs
                "verified",      // docs verified
                "payment_done",  // fees paid
                "admitted",      // final confirmation
                "rejected",      // application rejected
            ],
            default: "applied",
        },



        //  Staff remarks (during verification)
        staffRemarks: { type: String, default: null },
        bookedRoom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hostel",
            default: null
        },
        bookedRoomInWhichHostel:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hostel",
            default: null
        },
        confirmedRoom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hostel",
            default: null
        },
        credentialsGenerated: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

//  Auto-calc percentage if marks are available
admissionSchema.pre("save", function (next) {
    if (this.previousEducation?.marksObtained && this.previousEducation?.totalMarks) {
        this.previousEducation.percentage =
            (this.previousEducation.marksObtained / this.previousEducation.totalMarks) * 100;
    }
    next();
});

export const Admission = mongoose.model("Admission", admissionSchema);
