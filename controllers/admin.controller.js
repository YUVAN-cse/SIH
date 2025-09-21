import Admin from "../models/admin.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

//  Register a new Admin
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, role, phone, department } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json(new ApiError(400, "Admin already exists"));
    }

    const admin = await Admin.create({ name, email, password, role, phone, department });

    res
      .status(201)
      .json(new ApiResponse(201, "Admin registered successfully", { id: admin._id }));
  } catch (err) {
    res.status(500).json(new ApiError(500, err.message));
  }
};

//  Login Admin
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json(new ApiError(404, "Admin not found"));
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json(new ApiError(401, "Invalid credentials"));
    }

    const accessToken = admin.generateAccessToken();
    const refreshToken = admin.generateRefreshToken();

    await admin.save();

    admin.lastLogin = new Date();
    await admin.save();

    res.status(200)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 55,
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 55,
    })
    .json(
      new ApiResponse(200, "Login successful", {
        accessToken,
        refreshToken,
        role: admin.role,
      })
    );
  } catch (err) {
    res.status(500).json(new ApiError(500, err.message));
  }
};

//  Refresh Token
export const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(401).json(new ApiError(401, "Refresh token missing"));

    const admin = await Admin.findOne({ refreshToken: token });
    if (!admin) {
      return res.status(403).json(new ApiError(403, "Invalid refresh token"));
    }

    const newAccessToken = admin.generateAccessToken();
    const newRefreshToken = admin.generateRefreshToken();

    await admin.save();

    res.status(200)
    .cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 55,
    })
    .cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 55,
    })
    .json(
      new ApiResponse(200, "Token refreshed", {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      })
    );
  } catch (err) {
    res.status(500)
    .json(new ApiError(500, err.message));
  }
};

//  Logout Admin
export const logoutAdmin = async (req, res) => {
  try {
    const { id } = req.user; // from auth middleware
    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(404).json(new ApiError(404, "Admin not found"));
    }

    admin.refreshToken = null;
    await admin.save();

    res.status(200).json(new ApiResponse(200, "Logged out successfully"));
  } catch (err) {
    res.status(500).json(new ApiError(500, err.message));
  }
};

//  Get all Admins (superadmin only)
export const getAllAdmins = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json(new ApiError(403, "Access denied"));
    }

    const admins = await Admin.find().select("-password -refreshToken");
    res.status(200).json(new ApiResponse(200, "Admins fetched", admins));
  } catch (err) {
    res.status(500).json(new ApiError(500, err.message));
  }
};

//  Update Admin Role (superadmin only)
export const updateAdminRole = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json(new ApiError(403, "Access denied"));
    }

    const { adminId, role } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json(new ApiError(404, "Admin not found"));
    }

    admin.role = role;
    await admin.save();

    res.status(200).json(new ApiResponse(200, "Role updated", { id: admin._id, role: admin.role }));
  } catch (err) {
    res.status(500).json(new ApiError(500, err.message));
  }
};

//  Delete Admin (superadmin only)
export const deleteAdmin = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json(new ApiError(403, "Access denied"));
    }

    const { adminId } = req.params;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json(new ApiError(404, "Admin not found"));
    }

    await admin.remove();

    res.status(200).json(new ApiResponse(200, "Admin deleted"));
  } catch (err) {
    res.status(500).json(new ApiError(500, err.message));
  }
};

