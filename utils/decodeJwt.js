const jwt = require("jsonwebtoken");
const config = require("config");
function decodeJWT(token) {
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decodedToken = jwt.verify(token, config.get("jwtPrivateKey"));
    const userId = decodedToken._id;
    const isAdmin = decodedToken.isAdmin;

    return { userId, isAdmin };
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}

exports.decodeJWT = decodeJWT;
