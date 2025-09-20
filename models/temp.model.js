import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const tempSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    status: { type: String, required: true }, // e.g., "draft", "submitted"
  },
  { timestamps: true }
);

// 🔹 Hash password before saving
tempSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔹 Compare entered password with hashed password
tempSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 🔹 Generate Access Token (only)
tempSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" } // adjust as needed
  );
};

const Temp = mongoose.model("Temp", tempSchema);
export default Temp;
