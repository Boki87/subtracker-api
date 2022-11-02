import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import auth from "./routes/auth";
import subscriptions from "./routes/subscriptions";
import categories from "./routes/categories"
import cors from "cors";

dotenv.config({ path: "./config/config.env" });
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// Mount routers
app.use("/api/v1/auth", auth);
app.use("/api/v1/subscriptions", subscriptions);
app.use("/api/v1/categories", categories);

app.get("/", (req, res) => {
  res.send("Express + Typescript Server");
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running at https://localhost:${port}`);
});
