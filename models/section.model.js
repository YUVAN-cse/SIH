import mongoose from "mongoose";

const SectionSchema = new mongoose.Schema({
  sectionNumber: { type: Number, required: true, min: 1, max: 8, unique: true }, // 1-8
  name: { type: String, required: true }, // e.g. "Computer Science", "Maths"
  description: { type: String }
}, { timestamps: true });

export default mongoose.model("Section", SectionSchema);
