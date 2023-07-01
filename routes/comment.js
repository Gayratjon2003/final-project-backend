const express = require("express");
const router = express.Router();
const _ = require("lodash");
const auth = require("../middleware/auth");
const { User } = require("../models/user");
const { Category } = require("../models/category");
const { Collection } = require("../models/collection");
const { Item } = require("../models/item");
const Joi = require("joi");
const decodeJWT = require("../utils/decodeJwt");

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  let decoded = decodeJWT(req.header("x-auth-token"));
  const {  itemId, comment } = req.body;
  let item = await Item.findById(itemId);
  let user = await User.findById(decoded.payload?._id);
  if (item) {
    let commentObject = {
      _id: user._id,
      image: user?.image,
      name: user.name,
      comment,
    };
     await Item.updateOne(
      { _id: itemId },
      { $push: { comments: commentObject } }
    );
    return res.status(200).send(commentObject);
  }
});

function validate(item) {
  const schema = {
    itemId: Joi.string().required(),
    comment: Joi.string().min(1).max(255).required(),
  };

  return Joi.validate(item, schema);
}

module.exports = router;
