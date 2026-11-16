import mongoose from "mongoose";
export default async function connectDatabase() {
  if (!process.env.MONGODB_URI)
    throw Object.assign(new Error(), { code: "MISSING_URI" });
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log(`Connected to MongoDB (Database: ${mongoose.connection.name})`);
}
