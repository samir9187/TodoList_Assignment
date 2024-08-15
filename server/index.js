import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "https://todo-list-fireai.netlify.app",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true,
  })
);

app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);
const PORT = 5000;
app.listen(PORT, () => {
  console.log("Listening on port 5000");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(`MongoDB Atlas Connected !!`);
  })
  .catch((err) => {
    console.log(err);
  });
