const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
require("../config/passport");

// Register
const registerUser = async (req, res) => {
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
};

// Login user.
const loginUser = async (req, res) => {
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
  return res.send({
    success: true,
    message: "user is logged in successfully",
    token: "Bearer" + token,
  });
};

module.exports = {
  registerUser,
  loginUser,
};
