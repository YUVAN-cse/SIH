import jwt from "jsonwebtoken";
import temp from "../models/temp.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export const verifyJWT = (req, res, next) => {
    const token = req.cookies.accessToken;
    if (!token) {
        return res.status(401).json(new ApiError(401, "Unauthorized"));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
    } catch (error) {
        return res.status(401).json(new ApiError(401, "Unauthorized"));
    }

    next();
};