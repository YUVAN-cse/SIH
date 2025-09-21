import cron from "node-cron";
import BookTransaction from "../models/bookTransaction.model.js";
import Book from "../models/book.model.js";

// Runs every hour
cron.schedule("0 * * * *", async () => {
  console.log("⏳ Running auto-cancel job for expired bookings...");

  try {
    const now = new Date();

    // Find expired bookings
    const expiredBookings = await BookTransaction.find({
      status: "booked",
      pickupDeadline: { $lt: now }
    }).populate("book");

    for (const tx of expiredBookings) {
      tx.status = "cancelled";
      tx.cancelledAt = new Date();
      await tx.save();

      // Increase availableQuantity back
      const book = await Book.findById(tx.book._id);
      if (book) {
        book.availableQuantity += 1;
        await book.save();
      }

      console.log(`❌ Booking cancelled: ${tx._id} for book ${tx.book.title}`);
    }
  } catch (err) {
    console.error("Error in auto-cancel job:", err);
  }
});
