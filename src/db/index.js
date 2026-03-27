import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    console.log(`uri:${process.env.MONGO_URI}`)
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`
    );

    console.log(
      `Mongoose connected successfully: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("Mongoose connection error:", error);
    process.exit(1);
  }
};

export default connectDB;