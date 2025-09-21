import dotenv from "dotenv";

// dotenv.config({
//   path: "./.env",
// });

import app from "./app.js";
import connectDB from "./db/db.config.js";

const PORT = 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
.catch((error) => {
  console.error("Database connection failed:", error.message);
  process.exit(1);
});