import express from "express";
import cors from "cors";
import routes from "./Routes/routes.js";
const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json({ limit: "64kb" }));
app.use("/api", routes);
app.use((req, res) => res.status(404).json({ error: "API route not found" }));
app.use((err, req, res, next) =>
  res
    .status(err.status || 400)
    .json({
      error:
        err.code === 11000
          ? "This record already exists"
          : "Unable to complete request",
    }),
);
export default app;
