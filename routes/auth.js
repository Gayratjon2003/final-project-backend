const { User } = require("../models/user");
const express = require("express");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const router = express.Router();
const _ = require("lodash");

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Email or password is incorrect");
  const isValidPassword = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!isValidPassword)
    return res.status(400).send("Email or password is incorrect");
  if (user.status === "Blocked") return res.status(400).send("You are blocked");

  const token = user.generateAuthToken();
  let userLastLoginTime = await User.findByIdAndUpdate(
    user._id,
    { lastLoginTime: new Date() },
    {
      new: true,
    }
  );

  res
    .header("x-auth-token", token)
    .send({ text: "You are logged in", token: token, _id: user._id });
});


function validate(req) {
  const schema = {
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(1).max(255).required(),
  };

  return Joi.validate(req, schema);
}

module.exports = router;
