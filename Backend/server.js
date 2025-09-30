import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // load .env first

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.API_KEY
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

app.post("/ask", async (req, res) => {
  try {
    if (!API_KEY || !API_URL) {
      throw new Error("API key or API URL missing");
    }

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    // If the upstream API failed:
    if (!response.ok) {
      const text = await response.text();
      console.error("Gemini API error:", text);
      return res.status(response.status).send(text);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(5000, () =>
  console.log("✅ Backend running on http://localhost:5000")
);
