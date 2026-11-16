import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";
import connectDatabase from "./config/database.js";
try {
  await connectDatabase();
  const port = Number(process.env.PORT || 5005);
  const server = app.listen(port, () =>
    console.log("NEAR-Fix API ready on port " + port),
  );
  server.on("error", async (error) => {
    console.error(
      error.code === "EADDRINUSE"
        ? "Port " +
            port +
            " is already occupied. Stop the other server or update PORT and the frontend VITE_API_URL."
        : "Unable to start the HTTP server. Error code: " + error.code,
    );
    await mongoose.disconnect();
    process.exitCode = 1;
  });
} catch (error) {
  if (["ENOTFOUND", "ENODATA"].includes(error.code)) {
    console.error(
      "MongoDB DNS lookup failed. Copy the exact cluster hostname from Atlas → Connect → Drivers into Server/.env. Check that the cluster exists and is running. This failure happens before password authentication.",
    );
  } else if (error.code === "MISSING_URI") {
    console.error("Set MONGODB_URI in Server/.env before starting the server.");
  } else if (error.code === 18) {
    console.error(
      "MongoDB authentication failed. Check the database username and URL-encoded password in Server/.env.",
    );
  } else {
    console.error(
      "MongoDB connection failed. Check the Atlas connection string, Network Access list, and network connectivity.",
    );
  }
  process.exitCode = 1;
}
