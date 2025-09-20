import { User } from "../models/rolebasedlogin.model.js";

// Dummy data for now
const adminDummyData = { email: "admin@example.com", password: "admin123" };
const studentDummyData = { regNo: "S12345", password: "student123" };
const facultyDummyData = {
  email: "faculty@example.com",
  password: "faculty123",
};

// Controller to handle role-based login
export const roleBasedLogin = async (req, res) => {
  const { role } = req.body;

  if (!role || !["student", "admin", "faculty"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  if (role === "student") {
    return res.status(200).json({ message: "Navigate to Student Login" });
  }

  if (role === "admin") {
    return res.status(200).json({ message: "Navigate to Admin Login" });
  }

  if (role === "faculty") {
    return res.status(200).json({
      message:
        "Navigate to Faculty Role Login (Teacher, Hostel Warden, Librarian)",
    });
  }
};

// Controller for student login
export const studentLogin = async (req, res) => {
  const { regNo, password } = req.body;

  // Dummy student login validation
  if (
    regNo === studentDummyData.regNo &&
    password === studentDummyData.password
  ) {
    return res.status(200).json({ message: "Student login successful" });
  } else {
    return res
      .status(400)
      .json({ error: "Invalid registration number or password" });
  }
};

// Controller for admin login
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  // Dummy admin login validation
  if (email === adminDummyData.email && password === adminDummyData.password) {
    return res.status(200).json({ message: "Admin login successful" });
  } else {
    return res.status(400).json({ error: "Invalid email or password" });
  }
};

// Controller for faculty login
export const facultyLogin = async (req, res) => {
  const { email, password, facultyRole } = req.body;

  // Dummy faculty login validation
  if (
    facultyRole &&
    ["teacher", "hostel_warden", "librarian"].includes(facultyRole)
  ) {
    if (
      password === facultyDummyData.password &&
      email === facultyDummyData.email
    ) {
      return res
        .status(200)
        .json({ message: `${facultyRole} login successful` });
    }
  }

  return res
    .status(400)
    .json({ error: "Invalid faculty email, role or password" });
};
