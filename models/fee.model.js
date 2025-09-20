import mongoose from "mongoose";


//for billing purpose 

const feeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },  
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      required: false, // optional, only if hostel fee
    },
    type: {
      type: String,
      enum: ["tuition", "hostel", "transport", "library", "exam", "other"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    fine: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "partially_paid", "paid", "overdue"],
      default: "pending",
    },
    receiptNo: { type: String, unique: true },
  },
  { timestamps: true }
);

// ✅ Auto-update status before saving
feeSchema.pre("save", function (next) {
  if (this.paidAmount === 0) {
    this.status = "pending";
  } else if (this.paidAmount < this.amount) {
    this.status = "partially_paid";
  } else if (this.paidAmount >= this.amount) {
    this.status = "paid";
  }

  if (this.dueDate < new Date() && this.paidAmount < this.amount) {
    this.status = "overdue";
  }

  next();
});

const Fee = mongoose.model("Fee", feeSchema);
export default Fee;
