const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const dbConnect = require("./config/database");
const passport = require("passport");
require("./config/database");
require("./config/passport");
const User = require("./models/user.model");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

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
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (user) return res.status(404).send("user already exist");

    bcrypt.hash(password, saltRounds, async (err, hash) => {
      const newUser = new User({
        username: username,
        password: hash,
      });
      await newUser
        .save()
        .then((user) =>
          res.send({
            success: true,
            message: "user created successfully",
            user: {
              id: user._id,
              username: user.username,
            },
          })
        )
        .catch((error) => {
          res.send({
            success: false,
            message: "user isn't created",
            error: error.message,
          });
        });
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      message: "user doesn't created",
    });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user)
    return res.status(404).send({
      success: false,
      message: " user not found",
    });

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(404).send({
      success: false,
      message: "Password is incorrect",
    });
  }

  // token implementation
  const payload = {
    id: user._id,
    username: user.username,
  };
  const token = jwt.sign(payload, process.env.privateKey, { expiresIn: "1d" });
  return res.status(200).send({
    success: true,
    message: "user is logged in successfully",
    token: "Bearer" + token,
  });
});

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
