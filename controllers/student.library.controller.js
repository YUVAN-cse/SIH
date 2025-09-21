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

// ✅ Book a Book
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

    res.status(201).json(transaction);
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
