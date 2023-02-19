const mongoose = require("mongoose");
mongoose.set("strictQuery", true);
require("dotenv").config();

const dbConnect = (url) => {
  return mongoose.connect(url);
};

module.exports = dbConnect;
