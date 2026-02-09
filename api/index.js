const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ serverless-safe DB connection
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI not defined");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI)
      .then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// ✅ ROOT TEST ROUTE
app.get("/", async (req, res) => {
  try {
    await connectDB();
    res.status(200).json({ success: true, message: "API working on Vercel 🚀" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ LOAD ROUTES SAFELY
app.use("/api/temples", require("../routes/temples"));
app.use("/api/auth", require("../routes/auth"));

// ❌ NO app.listen
module.exports = app;
