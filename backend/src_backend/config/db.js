import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // fail faster (5 seconds)
    });
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("❌ DB Connection Error:", error.message);
  }
};

export default connectDB;
