const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// ✅ Serverless-safe MongoDB connection
let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI not set");
  }

  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log("MongoDB Connected");
}

// test route
app.get("/", async (req, res) => {
  try {
    await connectDB();
    res.send("API is running on Vercel 🚀");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// routes
app.use("/api/temples", require("../routes/temples"));
app.use("/api/auth", require("../routes/auth"));

// ❌ NO app.listen()
module.exports = app;
