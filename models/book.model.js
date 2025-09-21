import mongoose from "mongoose";

const BookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    isbn: { type: String, unique: true }, // optional unique ID
    section: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true },
    coverImage: { type: String, required: true },
    totalQuantity: { type: Number, required: true },
    availableQuantity: { type: Number, required: true },

    // For digital map (maybe store rack info too)
    rack: { type: String }, // e.g., "Rack A3"
}, { timestamps: true });

export default mongoose.model("Book", BookSchema);
