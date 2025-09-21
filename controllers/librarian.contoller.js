import Section from "../models/section.model.js";
import Book from "../models/book.model.js";
import BookTransaction from "../models/bookTransaction.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Librarian from "../models/librarian.model.js";
import jwt from "jsonwebtoken";

//  Register Librarian
export const registerLibrarian = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json(new ApiError(400, "All fields are required"));
        }

        const existing = await Librarian.findOne({ email });
        if (existing) {
            return res.status(400).json(new ApiError(400, "Email already registered"));
        }

        const librarian = await Librarian.create({
            name,
            email,
            password,
            phone
        });

        res
            .status(201)
            .json(new ApiResponse(201, { id: librarian._id, email: librarian.email, role: librarian.role }, "Librarian registered successfully"));
    } catch (err) {
        res.status(500).json(new ApiError(500, err.message));
    }
};

//  Login Librarian
export const loginLibrarian = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json(new ApiError(400, "Email and password required"));
        }

        const librarian = await Librarian.findOne({ email });
        if (!librarian) {
            return res.status(404).json(new ApiError(404, "Librarian not found"));
        }

        const isMatch = await librarian.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json(new ApiError(401, "Invalid credentials"));
        }

        const token = librarian.generateAccessToken();

        res
            .status(200)
            .cookie("accessToken", token, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 1000 * 60 * 55
            })
            .json(new ApiResponse(200, { token, role: librarian.role, name: librarian.name }, "Login successful"));
    } catch (err) {
        res.status(500).json(new ApiError(500, err.message));
    }
};

//  Logout Librarian
export const logoutLibrarian = async (req, res) => {
    try {
        // if using stateless JWT, client removes token from storage
        res.status(200)
        .clearCookie("accessToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 1000 * 60 * 55
        })
        .json(new ApiResponse(200, {}, "Logout successful (remove token on client side)"));
    } catch (err) {
        res.status(500).json(new ApiError(500, err.message));
    }
};

//  Get Librarian Profile
export const getLibrarianProfile = async (req, res) => {
    try {
        const librarian = await Librarian.findById(req.user.id).select("-password");
        if (!librarian) {
            return res.status(404).json(new ApiError(404, "Librarian not found"));
        }
        res.status(200).json(new ApiResponse(200, librarian));
    } catch (err) {
        res.status(500).json(new ApiError(500, err.message));
    }
};

//  View All Sections with Books
export const getLibraryMap = async (req, res) => {
    try {
        const sections = await Section.find().populate("books");
        const books = await Book.find().populate("section");
        res.status(200).json({ sections, books });
    } catch (err) {
        res.status(400).json(new ApiError(400, err.message));
    }
};

//  Book a Book (Student)
export const bookBook = async (req, res) => {
    try {
        const { bookId } = req.params;
        const studentId = req.user.id; // from auth middleware

        const book = await Book.findById(bookId);
        if (!book) return res.status(404).json(new ApiError(404, "Book not found"));
        if (book.availableQuantity <= 0) {
            return res.status(400).json(new ApiError(400, "No copies available"));
        }

        // Reduce availableQuantity
        book.availableQuantity -= 1;
        await book.save();

        const transaction = await BookTransaction.create({
            student: studentId,
            book: bookId,
            status: "booked",
            bookedAt: new Date(),
            pickupDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day
        });

        res.status(201).json(new ApiResponse(201, transaction));
    } catch (err) {
        res.status(400).json(new ApiError(400, err.message));
    }
};

//  View Student Transactions (Dashboard)
export const getStudentTransactions = async (req, res) => {
    try {
        const studentId = req.user.id;
        const transactions = await BookTransaction.find({ student: studentId })
            .populate("book")
            .sort({ createdAt: -1 });

        res.json(transactions);
    } catch (err) {
        res.status(400).json(new ApiError(400, err.message));
    }
};

//  Create Section
export const createSection = async (req, res) => {
    try {
        const section = await Section.create(req.body);
        res.status(201).json(new ApiResponse(201, section));
    } catch (err) {
        res.status(400).json(new ApiError(400, err.message));
    }
};

//  Add Book to Section
export const addBook = async (req, res) => {
    try {
        const {  title, author, totalQuantity, rack  } = req.body;
        const { sectionId } = req.params;

        if (!sectionId || !title || !author || !totalQuantity) {
            return res.status(400).json(new ApiError(400, "All fields are required"));
        }

        const section = await Section.findById(sectionId);
        if (!section) return res.status(404).json(new ApiError(404, "Section not found"));

        const book = await Book.create({
            section: sectionId,
            title,
            author,
            totalQuantity,
            availableQuantity: totalQuantity,
            rack
        });

        res.status(201).json(new ApiResponse(201, book));
    } catch (err) {
        res.status(400).json(new ApiError(400, err.message));
    }
};

//  Confirm Book Pickup (Librarian)
export const confirmPickup = async (req, res) => {
    try {
        console.log(req.params.id);
        const transaction = await BookTransaction.findById(req.params.id).populate("book");
        if (!transaction) return res.status(404).json(new ApiError(404, "Transaction not found"));

        if (transaction.status !== "booked") {
            return res.status(400).json(new ApiError(400, "Book not in booked state"));
        }

        // Check if deadline expired
        if (transaction.pickupDeadline < new Date()) {
            transaction.status = "cancelled";
            transaction.cancelledAt = new Date();
            await transaction.save();

            // Restore availability
            const book = await Book.findById(transaction.book._id);
            if (book) {
                book.availableQuantity += 1;
                await book.save();
            }

            return res.status(400).json(new ApiError(400, "Pickup deadline exceeded"));
        }

        // Mark as borrowed
        transaction.status = "borrowed";
        transaction.borrowedAt = new Date();
        // Set return deadline (e.g., 14 days from borrowedAt)
        transaction.returnDeadline = new Date(transaction.borrowedAt.getTime() + 14 * 24 * 60 * 60 * 1000);
        
        await transaction.save();

        res.status(200).json(new ApiResponse(200, transaction));
    } catch (err) {
        res.status(400).json(new ApiError(400, err.message));
    }
};

//  Confirm Book Return (Librarian)
export const confirmReturn = async (req, res) => {
    try {
        const transaction = await BookTransaction.findById(req.params.id).populate("book");
        if (!transaction) return res.status(404).json(new ApiError(404, "Transaction not found"));

        if (transaction.status !== "borrowed") {
            return res.status(400).json(new ApiError(400, "Book not in borrowed state"));
        }

        transaction.status = "returned";
        transaction.returnedAt = new Date();
        await transaction.save();

        // Increase availableQuantity
        const book = await Book.findById(transaction.book._id);
        if (book) {
            book.availableQuantity += 1;
            await book.save();
        }

        res.status(200).json(new ApiResponse(200, transaction));
    } catch (err) {
        res.status(400).json(new ApiError(400, err.message));
    }
};


/*
    getOverdueBooks (Librarian) – (with Cron Job)
    Purpose: Used by cron job (or admin panel) to check overdue reservations.
    Finds all transactions where:
    status = booked
    pickupDeadline < now
    Marks them as cancelled.
    Increases availableQuantity for those books.
    👉 This ensures no book stays “blocked” forever if a student doesn’t collect it.
*/


//  Librarian: Get Overdue Borrowed Books
export const getOverdueBooks = async (req, res) => {
    try {
        const now = new Date();
        const overdue = await BookTransaction.find({
            status: "borrowed",
            pickupDeadline: { $lt: now }
        }).populate("book student");

        res.status(200).json(new ApiResponse(200, overdue));
    } catch (err) {
        res.status(400).json(new ApiError(400, err.message));
    }
};
