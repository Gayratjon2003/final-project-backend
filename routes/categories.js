const express = require("express");
const router = express.Router();
const { Category, validate } = require("../models/category");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const mongoose = require("mongoose");
router.get("/", async (req, res) => {
  const categories = await Category.find().sort("name");
  res.send(categories);
});

router.post("/", [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  const existingValue = await Category.findOne({ name: req.body.name });
  if (existingValue) {
    return res.status(404).send("This category has already been added");
  }
  let category = new Category({
    name: req.body.name,
  });
  category = await category.save();
  res.status(201).send(category);
});

router.get("/", async (req, res) => {
  let category = await Category.find();
  res.send(category);
});
router.get("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(404).send("Invalid ID");
  try {
    let category = await Category.findById(req.params.id);
    if (!category)
      return res
        .status(404)
        .send("No category equal to the given ID was found");

    res.send(category);
  } catch (err) {
    return res.status(404).send("No category equal to the given ID was found");
  }
});

router.put("/:id", [auth, admin], async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    let category = await Category.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      {
        new: true,
      }
    );
    res.send(category);
  } catch (err) {
    return res.status(404).send("No category equal to the given ID was found");
  }
});

router.delete("/:id", [auth, admin], async (req, res) => {
  try {
    let category = await Category.findByIdAndRemove(req.params.id);
    if (!category)
      return res
        .status(404)
        .send("No category equal to the given ID was found");
    res.send(category);
  } catch (err) {
    return res.status(404).send("No category equal to the given ID was found");
  }
});
module.exports = router;
