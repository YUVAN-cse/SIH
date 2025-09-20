import dotenv from "dotenv";

// dotenv.config({
//   path: "./.env",
// });

import app from "./app.js";
import connectDB from "./db/db.config.js";

const PORT = 5000;

// connectDB()
//   .then(() =>
//   )
//   .catch((error) => console.log(error));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
