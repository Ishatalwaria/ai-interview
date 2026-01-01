// import mongoose from 'mongoose';

// const connectDB = async() => {
//     try {
//         await mongoose.connect(process.env.MONGO_URL, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         });
//     } catch (error) {
//         process.exit(1);
//     }
// }

// export default connectDB;


import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URL;
    if (!uri) throw new Error("MONGO_URL is missing in .env");

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

export default connectDB;

