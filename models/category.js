const mongoose = require("mongoose");
const Joi = require("joi");

const categorySchema = new mongoose.Schema({
  name: {
    type: Object,
    required: true,
    uz: {
      type: String,
      required: true,
    },
    en: {
      type: String,
      required: true,
    },
  },
});
const Category = mongoose.model("Category", categorySchema);
function validateCategory(category) {
  const schema = {
    name: Joi.object().min(2).max(50).required(),
  };

  return Joi.validate(category, schema);
}
exports.Category = Category;
exports.validate = validateCategory;
exports.categorySchema = categorySchema;
