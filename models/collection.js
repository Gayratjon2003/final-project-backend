const mongoose = require("mongoose");
const Joi = require("joi");
const { categorySchema } = require("./category");

const collectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  
  addedBy: {
    _id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  image: {
    public_id: {
      type: String,
      required: false,
    },
    url: {
      type: String,
      required: false,
    },
  },
  volume: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  publishedAt: {
    type: String,
    required: true,
  },
  category: {
    type: categorySchema,
    required: true,
  },
  fields: {
    type: Array,
    required: false
  },
  
});
const Collection = mongoose.model("Collection", collectionSchema);
function validateCollection(collection) {
  const schema = {
    name: Joi.string().min(2).max(50).required(),
    description: Joi.string().min(1).max(4096).required(),
    categoryId: Joi.string().required(),
    fields: Joi.array().items(Joi.object()),
    image: Joi.any(),
  };

  return Joi.validate(collection, schema);
}
exports.Collection = Collection;
exports.validate = validateCollection;
exports.collectionSchema = collectionSchema;
