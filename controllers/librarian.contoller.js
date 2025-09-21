import Section from "../models/section.model.js";
import Book from "../models/book.model.js";
import BookTransaction from "../models/bookTransaction.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// ✅ View All Sections with Books
export const getLibraryMap = async (req, res) => {
    try {
        const sections = await Section.find().populate("books");
        const books = await Book.find().populate("section");
        res.status(200).json({ sections, books });
    } catch (err) {
        res.status(400).json(new ApiError(400, err.message));
    }
};

// ✅ Book a Book (Student)
export const bookBook = async (req, res) => {
    try {
        const { bookId } = req.params;
        const studentId = req.user._id; // from auth middleware

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

// ✅ View Student Transactions (Dashboard)
export const getStudentTransactions = async (req, res) => {
    try {
        const studentId = req.user._id;
        const transactions = await BookTransaction.find({ student: studentId })
            .populate("book")
            .sort({ createdAt: -1 });

        res.json(transactions);
    } catch (err) {
        res.status(400).json(new ApiError(400, err.message));
    }
};

// ✅ Create Section
export const createSection = async (req, res) => {
    try {
        const section = await Section.create(req.body);
        res.status(201).json(new ApiResponse(201, section));
    } catch (err) {
        res.status(400).json(new ApiError(400, err.message));
    }
};

// ✅ Add Book to Section
export const addBook = async (req, res) => {
    try {
        const { sectionId, title, author, isbn, totalQuantity, rack } = req.body;

        if (!sectionId || !title || !author || !totalQuantity) {
            return res.status(400).json(new ApiError(400, "All fields are required"));
        }

        const section = await Section.findById(sectionId);
        if (!section) return res.status(404).json(new ApiError(404, "Section not found"));

        const book = await Book.create({
            section: sectionId,
            title,
            author,
            isbn,
            totalQuantity,
            availableQuantity: totalQuantity,
            rack
        });

        res.status(201).json(new ApiResponse(201, book));
    } catch (err) {
        res.status(400).json(new ApiError(400, err.message));
    }
};

// ✅ Confirm Book Pickup (Librarian)
export const confirmPickup = async (req, res) => {
    try {
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
        await transaction.save();

        res.status(200).json(new ApiResponse(200, transaction));
    } catch (err) {
        res.status(400).json(new ApiError(400, err.message));
    }
};

// ✅ Confirm Book Return (Librarian)
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




// ✅ Librarian: Get Overdue Borrowed Books
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
