const config = require("config");
module.exports = function () {
  if (!config.get("jwtPrivateKey")) {
    console.error(
      "FATAL ERROR: environment variable task4_jwtPrivateKey is undefined"
    );
    throw new Error(
      "FATAL ERROR: environment variable task4_jwtPrivateKey is undefined"
    );
  }
};
