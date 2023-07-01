const { User, validate, validateUserPut } = require("../models/user");
const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const _ = require("lodash");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const {decodeJWT} = require("../utils/decodeJwt");

router.get("/me", auth, async (req, res) => {
  
  let decoded = decodeJWT(req.header("x-auth-token"));
  try {
    const user = await User.findById(decoded.payload?._id).select(
      "-password"
    );
    if (user.status === "Blocked") {
      return res.status(401).send("You're blocked");
    }
    return res.send(user);

  } catch (err) {
    return res.status(400).send("User not found");
  }
});
router.get("/", [auth, admin], async (req, res) => {
  let decoded = decodeJWT(req.header("x-auth-token"));
  try {
    const user = await User.findById(decoded.payload?._id).select("status");
    if (user.status === "Blocked") {
      return res.status(401).send("You're blocked");
    }
  } catch (err) {
    return res.status(400).send("User not found");
  }

  const users = await User.find().select("-password");
  res.send(users);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("An existing user");
  const registerTime = new Date();
  const lastLoginTime = new Date();
  const pickedValues = {
    ..._.pick(req.body, ["name", "email", "password", "isAdmin", "status"]),
    lastLoginTime: lastLoginTime,
    registerTime: registerTime,
  };
  user = new User(pickedValues);
  const salt = await bcrypt.genSalt();
  user.password = await bcrypt.hash(user.password, salt);

  const token = user.generateAuthToken();
  await user.save();

  res.send({
    ..._.pick(user, [
      "_id",
      "name",
      "email",
      "isAdmin",
      "status",
      "lastLoginTime",
      "registerTime",
    ]),
    token: token,
  });
});

router.put("/:id", [auth, admin], async (req, res) => {
  try {
    const { error } = validateUserPut(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    let user = await User.findByIdAndUpdate(
      req.params.id,
      { status: req.body?.status, isAdmin: req.body?.isAdmin },
      {
        new: true,
      }
    );
    res.send(user);
  } catch (err) {
    return res.status(404).send("ID not found");
  }
});
router.delete("/:id", [auth, admin], async (req, res) => {
  try {
    let user = await User.findByIdAndRemove(req.params.id);
    if (!user) return res.status(404).send("ID not found");
    res.send(user);
  } catch (err) {
    return res.status(404).send("ID not found");
  }
});

module.exports = router;
