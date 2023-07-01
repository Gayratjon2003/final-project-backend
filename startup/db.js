const mongoose = require("mongoose");
const winston = require("winston");
const config = require("config");
mongoose.set("strictQuery", false);
module.exports = async function () {
  try {
    await mongoose.connect(config.get("db"), { 
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    winston.debug("mongoDb connected..");
  } catch (error) {
    winston.error("Error: ", error);
  }
};
