const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { Item } = require("../models/item");
const mongoose = require("mongoose");
const {decodeJWT} = require("../utils/decodeJwt");
const {
  Types: { ObjectId },
} = mongoose;
router.post("/", auth, async (req, res) => {
  let decoded = decodeJWT(req.header("x-auth-token"));
  const userId = decoded.payload?._id;
  const { itemId } = req.body;
  const validateObjectId = (id) =>
    ObjectId.isValid(id) && new ObjectId(id).toString() === id;
  if (!validateObjectId(userId) || !validateObjectId(itemId)) {
    return res.status(400).send("User or ItemId is incorrect");
  }
  let item = await Item.find({
    _id: itemId,
    likes: { $in: [userId] },
  }).count();
  if (item === 0) {
    await Item.updateOne({ _id: itemId }, { $push: { likes: userId } });
  } else {
    await Item.updateOne({ _id: itemId }, { $pull: { likes: userId } });
  }
  res.send("ok");
});

module.exports = router;
