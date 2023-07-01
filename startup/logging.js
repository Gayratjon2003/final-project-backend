const winston = require("winston");
require("express-async-errors");
require("winston-mongodb");
module.exports = function () {
  winston.add(new winston.transports.Console());
  winston.add(
    new winston.transports.File({
      filename: "logs/vd-logs.log",
      level: "error",
    })
  );
 
  winston.exceptions.handle(
    new winston.transports.File({ filename: "logs/vd-logs.log" })
  );
  process.on("unhandledRejection", (ex) => {
    throw ex;
  });
};
