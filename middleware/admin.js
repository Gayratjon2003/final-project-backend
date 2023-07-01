const { User } = require("../models/user");
const  {decodeJWT} = require("../utils/decodeJwt");

module.exports = async function admin(req, res, next) {
  let {userId} = decodeJWT(req.header("x-auth-token"));
  const user = await User.findById(userId).select("isAdmin");
  if (!user?.isAdmin) {
    return res.status(403).send("The application was rejected");
  }
  next();
};
