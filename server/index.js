const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const dbConnect = require("./config/database");
const { registerUser, loginUser } = require("./controllers/user.controller");
const passport = require("passport");
require("./config/database");
require("./config/passport");
require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// authentication process
app.use(passport.initialize());

// Routes
app.get("/", (req, res) => {
  res.send("welcome to node server");
});

// Register
app.post("/register", registerUser);

// Login
app.post("/login", loginUser);

// Profile (protected)
app.get("/profile", passport.authenticate("jwt", { session: false }), (req, res) => {
  return res.status(200).send({
    success: true,
    user: {
      id: req.user._id,
      username: req.user.username,
    },
  });
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
