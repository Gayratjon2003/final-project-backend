const express = require("express");
const app = express();
const winston = require("winston");
require("./startup/logging")();
require("./startup/routes")(app);
require("./startup/db")();
const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  winston.info(`I started listening on port ${port}`);
});
module.exports = server;
