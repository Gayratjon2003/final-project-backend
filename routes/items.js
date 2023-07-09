const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { User } = require("../models/user");
const { Category } = require("../models/category");
const { Collection } = require("../models/collection");
const { Item, validate } = require("../models/item");
const cloudinary = require("../utils/cloudinary");
const { decodeJWT } = require("../utils/decodeJwt");

router.get("/latest", async (req, res) => {
  let items = await Item.find().sort({ _id: -1 }).limit(3);
  res.status(200).send(items);
});
router.get("/tags", async (req, res) => {
  let items = await Item.find({}).select({ _id: 0, tags: 1 });
  const tags = items.map((item) => item.tags).flat();

  res.status(200).send([...new Set(tags)]);
});
router.get("/all", auth, async (req, res) => {
  let { userId } = decodeJWT(req.header("x-auth-token"));
  if (!userId) {
    return res.status(400).send("Your token is old");
  }
  const user = await User.findById(userId);
  if (user.isAdmin) {
    let items = await Item.find();
    return res.status(200).send(items);
  } else {
    const item = await Item.find({
      "addedBy._id": userId,
    });
    return res.status(200).send(item);
  }
});
router.get("/", async (req, res) => {
  if (req.query?.collectionId) {
    let item = await Item.find({
      "collections._id": req.query?.collectionId,
    });
    return res.status(200).send(item);
  } else if (req.query?.search) {
    let result = await Item.find({
      $or: [
        { name: { $regex: req.query.search, $options: "i" } },
        { "collections.name": { $regex: req.query.search, $options: "i" } },
        { "comments.comment": { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query?.search, $options: "i" } },
        { tags: { $regex: req.query?.search, $options: "i" } },
      ],
    });
    return res.status(200).send(result);
  } else if (req.query?.tag) {
    let result = await Item.find({
      tags: { $regex: req.query?.tag },
    });
    return res.status(200).send(result);
  } else {
    let items = await Item.find();
    res.status(200).send(items);
  }
});
router.get("/:id", async (req, res) => {
  const item = await Item.findById(req.params.id);
  res.status(200).send(item);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  let { userId } = decodeJWT(req.header("x-auth-token"));
  const user = await User.findById(userId);
  let collection = await Collection.findById(req.body.collectionId);
  let result = "";

  if (req.body.image?.length) {
    result = await cloudinary.uploader.upload(req.body.image, {
      folder: "items",
    });
  }
  if (collection.addedBy._id.toString() === userId || user.isAdmin) {
    let item = new Item({
      name: req.body.name,
      author: req.body.author,
      collections: {
        _id: collection._id,
        name: collection.name,
        addedBy: collection.addedBy,
      },
      addedBy: {
        _id: user._id,
        name: user.name,
      },
      publishedAt: new Date(),
      tags: req.body.tags,
      likes: [],
      image: {
        public_id: result?.public_id,
        url: result?.secure_url,
      },
      customFields: {
        fields: collection.fields,
        values: req.body.values,
      },
      comments: [],
    });
    item.customFields.values.unshift(
      { name: "id", value: item._id, label: "ID" },
      {
        value: item.name,
        name: "name",
        label: "Name",
      },
      {
        value: item.tags,
        name: "tags",
        label: "Tags",
      }
    );
    item.customFields.fields.unshift(
      { name: "id", value: item._id, label: "ID" },
      {
        name: "name",
        value: item.name,
        label: "Name",
      },
      {
        name: "tags",
        value: item.tags,
        label: "Tags",
      }
    );
    item = await item.save();
    let volume = await Item.find({
      "collections._id": { $regex: req.body.collectionId },
    }).count();
    collection.volume = volume;
    collection = await collection.save();
    return res.status(201).send(item);
  } else {
    return res.status(401).send("You don't have permission");
  }
});
router.put("/:id", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  let { userId } = decodeJWT(req.header("x-auth-token"));
  const user = await User.findById(userId);
  let collection = await Collection.findById(req.body.collectionId);
  let result = "";

  if (req.body.image?.length) {
    result = await cloudinary.uploader.upload(req.body.image, {
      folder: "items",
    });
  }
  if (collection.addedBy._id === userId || user.isAdmin) {
    const oldItem = await Item.findById(req.params.id);
    let item = await Item.findById(req.params.id);
    item.image = {
      public_id: result?.public_id || oldItem.image.public_id,
      url: result?.secure_url || oldItem.image.url,
    };
    item.name = req.body.name;
    item.author = req.body.author;
    item.tags = req.body.tags;
    item.customFields = {
      fields: collection.fields,
      values: req.body.values,
    };
    item.customFields.values.unshift(
      { name: "id", value: item._id, label: "ID" },
      {
        value: item.name,
        name: "name",
        label: "Name",
      },
      {
        value: item.tags,
        name: "tags",
        label: "Tags",
      }
    );
    item.customFields.fields.unshift(
      { name: "id", value: item._id, label: "ID" },
      {
        name: "name",
        value: item.name,
        label: "Name",
      },
      {
        name: "tags",
        value: item.tags,
        label: "Tags",
      }
    );
    await item.save();
    let oldCollectionId = oldItem.collections._id;
    if (oldCollectionId !== req.body.collectionId) {
      let oldCollection = await Collection.findById(oldCollectionId);
      oldCollection.volume -= 1;
      await oldCollection.save();
    }
    let volume = await Item.find({
      "collections._id": { $regex: req.body.collectionId },
    }).count();
    collection.volume = volume;
    collection = await collection.save();
    return res.status(200).send(item);
  } else {
    return res.status(401).send("You don't have permission");
  }
});

router.delete("/:id", auth, async (req, res) => {
  let { userId } = decodeJWT(req.header("x-auth-token"));
  if (!userId) {
    return res.status(400).send("Your token is old");
  }
  const user = await User.findById(userId);
  const item = await Item.findById(req.params.id);
  const collectionId = item.collections._id;
  if (user._id.toString() === item.collections.addedBy || user.isAdmin) {
    const item = await Item.findByIdAndDelete(req.params.id);
    let collection = await Collection.findById(collectionId);
    collection.volume -= 1;
    await collection.save();
    res.status(200).send(item);
  } else {
    res.status(200).send("You don't have permission");
  }
});
module.exports = router;
