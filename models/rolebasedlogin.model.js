import mongoose from "mongoose";

// Define the schema for the User model
const userSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ["student", "admin", "faculty"], //main page, where it asks for role
  },
  email: {
    type: String,
    required: function () {
      return this.role === "admin" || this.role === "faculty"; //both admin and faculty need email for login
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  regNo: {
    type: String,
    required: function () {
      return this.role === "student"; //Only students require regNo
    },
  },
  facultyRole: {
    type: String,
    enum: ["teacher", "hostel_warden", "librarian"],
    required: function () {
      return this.role === "faculty"; //Only faculty have a sub-role
    },
  },
});

export const User = mongoose.model("User", userSchema);
