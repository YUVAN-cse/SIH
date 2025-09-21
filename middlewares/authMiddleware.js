import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js"; 

export const isAuthenticated = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(401).json(new ApiError(401, "Unauthorized"));
  }
 
  try {
    const decoded = jwt.decode(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (error) {
    return res.status(401).json(new ApiError(401, "Unauthorized"));
  }
 
  next();
};


export const isLibrarian = (req, res, next) => {
  if (req.user?.role !== "librarian") {
    return res.status(403).json(new ApiError(403, "Forbidden"));
  }
 
  next();
};

export const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json(new ApiError(403, "Forbidden"));
  }
  next();
};


export const isSuperAdmin = (req, res, next) => {
  if (req.user?.role !== "superadmin") {
    return res.status(403).json(new ApiError(403, "Forbidden"));
  }
  next();
}