import express from "express";
import {
  getLibraryMap,
  bookBook,
  getStudentTransactions,
  createSection,
  addBook,
  confirmPickup,
  confirmReturn,
  getOverdueBooks,
  registerLibrarian,
  loginLibrarian,
  logoutLibrarian,
  getLibrarianProfile,
} from "../controllers/librarian.contoller.js";
import { isAuthenticated, isLibrarian } from "../middlewares/authMiddleware.js";

const router = express.Router();


// ================== STUDENT ROUTES ==================

//  View all sections + books (digital map)
router.get("/map", isAuthenticated, getLibraryMap);

//  Book a book by ID
router.post("/book/:bookId", isAuthenticated, bookBook);

//  Student Dashboard: booked / borrowed / returned / cancelled
router.get("/transactions", isAuthenticated, getStudentTransactions);


// ================== LIBRARIAN ROUTES ==================

//  Create a new Section (like Section 1 to Section 8)
router.post("/sections", isAuthenticated, isLibrarian, createSection);

//  Add a new Book to Section
router.post("/books/section/:sectionId", isAuthenticated, isLibrarian, addBook);

//  Confirm Pickup (student comes to collect)
router.patch("/pickup/:id", isAuthenticated, isLibrarian, confirmPickup);

//  Confirm Return (student returns the book)
router.patch("/return/:id", isAuthenticated, isLibrarian, confirmReturn);

//  Register Librarian
router.post("/register", registerLibrarian);

//  Login Librarian
router.post("/login", loginLibrarian);

//  Logout Librarian
router.post("/logout", isAuthenticated, isLibrarian, logoutLibrarian);

//  Get Librarian Profile
router.get("/profile", isAuthenticated, isLibrarian, getLibrarianProfile);

//  Get Overdue Books (for cron job / admin)
router.get("/overdue", isAuthenticated, isLibrarian, getOverdueBooks);


export default router;
