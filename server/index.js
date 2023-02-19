const express = require("express");
const cors = require("cors");
const dbConnect = require("./config/database");
const app = express();
const port = process.env.PORT || 5000;
require("./config/database");
require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.send("welcome to node server");
});

// Server run

const start = async (req, res) => {
  try {
    await dbConnect(process.env.DB_URL);
    app.listen(port, () => {
      console.log(`JWT server is listening on http://localhost:${port}`);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

start();
