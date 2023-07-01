const express = require("express");
const router = express.Router();
const { Collection, validate } = require("../models/collection");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const cloudinary = require("../utils/cloudinary");
const { User } = require("../models/user");
const { Category } = require("../models/category");
const decodeJWT = require("../utils/decodeJwt");

router.get("/latest", async (req, res) => {
  let collections = await Collection.find().sort({ volume: -1 }).limit(5);
  res.status(200).send(collections);
});
router.get("/all", auth, async (req, res) => {
  let decoded = decodeJWT(req.header("x-auth-token"));
  if (!decoded.payload?._id) {
    return res.status(400).send("Your token is old");
  }
  const user = await User.findById(decoded.payload?._id);
  if (user.isAdmin) {
    let collections = await Collection.find();
    return res.status(200).send(collections);
  } else {
    const collection = await Collection.find({
      "addedBy._id": decoded.payload?._id,
    });
    return res.status(200).send(collection);
  }
});
router.get("/", async (req, res) => {
  let collections = await Collection.find();
  res.status(200).send(collections);
});
router.get("/:id", async (req, res) => {
  const collection = await Collection.findById(req.params.id);
  res.status(200).send(collection);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  let decoded = decodeJWT(req.header("x-auth-token"));
  let result = "";
  if (req.body.image?.length) {
    result = await cloudinary.uploader.upload(req.body.image, {
      folder: "collections",
    });
  }
  const user = await User.findById(decoded.payload?._id);
  const category = await Category.findById(req.body.categoryId);

  let collection = new Collection({
    name: req.body.name,
    addedBy: {
      _id: user._id,
      name: user.name,
    },
    volume: 0,
    image: {
      public_id: result?.public_id,
      url: result?.secure_url,
    },
    publishedAt: new Date(),
    description: req.body.description,
    category: category,
  });
  collection = await collection.save();
  res.status(201).send(collection);
});
router.put("/:id", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  let decoded = decodeJWT(req.header("x-auth-token"));
  let result = "";
  if (req.body.image?.length) {
    result = await cloudinary.uploader.upload(req.body.image, {
      folder: "collections",
    });
  }
  const user = await User.findById(decoded.payload?._id);
  const category = await Category.findById(req.body.categoryId);

  const oldCollection = await Collection.findById(req.params.id);
  if (user._id.toString() === oldCollection.addedBy._id || user.isAdmin) {
    const collection = await Collection.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        image: {
          public_id: result?.public_id || oldCollection.image.public_id,
          url: result?.secure_url || oldCollection.image.url,
        },
        description: req.body.description,
        category: category,
      },
      { new: true }
    );
    return res.status(200).send(collection);
  } else {
    return res.status(200).send("You don't have permission");
  }
});

router.delete("/:id", auth, async (req, res) => {
  let decoded = decodeJWT(req.header("x-auth-token"));
  if (!decoded.payload?._id) {
    return res.status(400).send("Your token is old");
  }
  const user = await User.findById(decoded.payload?._id);
  const collection = await Collection.findById(req.params.id);
  if (user._id.toString() === collection.addedBy._id || user.isAdmin) {
    const collection = await Collection.findByIdAndDelete(req.params.id);
    res.status(200).send(collection);
  } else {
    res.status(200).send("You don't have permission");
  }
});
module.exports = router;
