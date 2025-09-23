import Student from "../models/student.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Login a student with credential verification
export const loginStudent = async (req, res) => {
  const { email, password } = req.body;

  try {
    const student = await Student.findOne({ email });
    console.log(student);
    if (!student) return res.status(400).json({ message: "Student not found" });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    if(student.password !== password) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: student._id, role: "student" }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200)
    .cookie("accessToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 55
    })
    .json({
      token,
      student,
      redirectTo: "/student/dashboard",
      message: "Login successful - redirecting to dashboard",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
