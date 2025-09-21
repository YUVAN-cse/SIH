import PDFDocument from "pdfkit";
import fs from "fs";
import ApiError from "../utils/ApiError.js";
import Fee from "../models/fee.model.js";


// The user’s browser will automatically download the generated receipt PDF.
export const downloadReceiptForAdmissionFeePayment = async (req, res) => {
  // const fee = await Fee.findById(req.params.id).populate("studentId hostelId");
  const fee = await Fee.findOne({ studentId: req.user.id }).populate("studentId").populate({
    path: "hostelId",
    populate: {
      path: "blocks.floors.rooms",
      model: "Hostel",
    },
  });
  ;

  if (!fee) return res.status(404).json(new ApiError(404, "Receipt not found"));

  const doc = new PDFDocument();
  const filename = `receipt-${fee.receiptNo}.pdf`;
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", "application/pdf");

  doc.text("University Hostel Fee Receipt", { align: "center" });
  doc.moveDown();
  doc.text(`Receipt No: ${fee.receiptNo}`);
  doc.text(`Student: ${fee.studentId.name}`);
  doc.text(`Hostel: ${fee.hostelId.name}`);
  doc.text(`Type: ${fee.type}`);
  doc.text(`Amount: ₹${fee.paidAmount}`);
  doc.text(`Status: ${fee.status}`);
  doc.text(`Date: ${fee.paymentDate.toDateString()}`);

doc.pipe(res);
doc.end();
};

