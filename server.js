import express from "express";
import multer from "multer";
import { createWorker } from "tesseract.js";
import fs from "fs";

const app = express();
const upload = multer({ dest: "uploads/" });

// Initialize Tesseract worker
const worker = await createWorker("eng");
// const studentdata = {
//   name: "YOUR_NAME",
//   dateofbirth: "YOUR_DOB",
//   schoolname: "YOUR_SCHOOL_NAME",
// };

// Serve upload form
app.get("/", (req, res) => {
  res.send(`
    <h2>Upload a Document for OCR</h2>
    <form method="POST" action="/upload" enctype="multipart/form-data">
      <input type="file" name="document" accept=".png,.jpg,.jpeg" required />
      <button type="submit">Upload & Process</button>
    </form>
  `);
});

// Handle file upload and OCR
app.post("/upload", upload.single("document"), async (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");

  try {
    const {
      data: { text },
    } = await worker.recognize(req.file.path);

    // Delete uploaded file
    fs.unlink(req.file.path, () => {});

    res.send(`
      <h2>OCR Result</h2>
      <textarea rows="20" cols="80">${text}</textarea>
      <br /><a href="/">Upload another document</a>
    `);
    // if (
    //   text.toLowerCase().includes(studentdata.name.toLowerCase()) &&
    //   text.toLowerCase().includes(studentdata.dateofbirth.toLowerCase()) &&
    //   text.toLowerCase().includes(studentdata.schoolname.toLowerCase())
    // ) {
    //   console.log("Verified Student");
    // } else {
    //   console.log("Unverified Student");
    // }
  } catch (err) {
    console.error(err);
    res.status(500).send("OCR failed");
  }
});

app.listen(3000, () =>
  console.log("OCR server running at http://localhost:3000")
);
