import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

function connectDB() {
  // console.log("MONGODB_URI", MONGODB_URI);
  mongoose
    .connect(MONGODB_URI, {
      dbName: "AuthSystem",
      connectTimeoutMS: 30 * 1000,
    })
    .then(() => {
      console.log("✅ Connected to mongoDB");
    })
    .catch((err) => {
      console.log("❌ Error connecting to mongoDB");
    });
}

export default connectDB;
