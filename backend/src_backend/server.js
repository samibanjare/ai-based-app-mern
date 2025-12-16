import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import path from 'path';
import { fileURLToPath } from "url";
import errorHandler from "./middleware/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import documentRoutes from "./routes/documentsRoutes.js";
import flashcardRoutes from "./routes/flashcardRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";

//ES6 module __dirname alternative
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename) 

//connect to MongoDb
connectDB();

//initialize express app
const app = express();

//handling cors policy
const corsOptions = {
  origin: "http://localhost:5173",
  methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
  credentials: true,
}
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mounting the route
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/progress", progressRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Server running");
});
app.use(errorHandler);

//404 handle
app.use((req, res)=>{
  res.status(404).json({
    success: false,
    error: 'Route Not Found',
    statusCode: 404
  });
});

app.listen(5000, () => console.log("Server started on port 5000"));

process.on('unhandledRejection', (err)=>{
  console.error(`Error: ${err.message}`);
  process.exit(1);
})