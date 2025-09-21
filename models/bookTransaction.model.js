import mongoose from "mongoose";

const BookTransactionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },

  status: {
    type: String,
    enum: ["booked", "borrowed", "returned", "cancelled"],
    default: "booked"
  },

  bookedAt: { type: Date, default: Date.now }, // when student booked
  pickupDeadline: { type: Date }, // e.g., bookedAt + 1 day
  borrowedAt: { type: Date },
  returnedAt: { type: Date },
  cancelledAt: { type: Date },
}, { timestamps: true });

export default mongoose.model("BookTransaction", BookTransactionSchema);


//future feature 
//fine for late submission