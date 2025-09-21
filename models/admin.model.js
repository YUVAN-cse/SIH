import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const AdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },

    role: {
      type: String,
      enum: ["superadmin", "librarian", "hostelAdmin", "examAdmin", "financeAdmin"],
      default: "superadmin",
    },

    phone: { type: String },
    department: { type: String }, // optional (like "Library", "Hostel")

    lastLogin: { type: Date },
    isActive: { type: Boolean, default: true },
    
    refreshToken: { type: String, default: null },
  },
  { timestamps: true }
);

// 🔒 Hash password before saving
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ✅ Compare password
AdminSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// 🔑 Generate JWT access token
AdminSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: "55m" }
  );
};

// 🔄 Generate JWT refresh token
AdminSchema.methods.generateRefreshToken = function () {
  const token = jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  this.refreshToken = token;
  return token;
};

export default mongoose.model("Admin", AdminSchema);
