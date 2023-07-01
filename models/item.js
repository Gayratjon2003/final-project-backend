const Joi = require("joi");
const mongoose = require("mongoose");
const { categorySchema } = require("./category");
const { collectionSchema } = require("./collection");
const { userSchema } = require("./user");
const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  collections: {
    _id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  category: {
    type: categorySchema,
    required: true,
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
  author: {
    type: String,
    required: true,
  },
  publishedAt: {
    type: String,
    required: true,
  },
  tags: {
    type: Array,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  likes: {
    type: Array,
    required: true,
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
  comments: [
    {
      _id: {
        type: String,
        required: true,
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
      name: {
        type: String,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
});

const Item = mongoose.model("Item", itemSchema);

function validateItem(item) {
  const schema = {
    name: Joi.string().min(1).max(50).required(),
    author: Joi.string().min(1).max(255).required(),
    categoryId: Joi.string().required(),
    collectionId: Joi.string().required(),
    tags: Joi.array().items(Joi.string()),
    description: Joi.string().min(1).max(4096).required(),
    image: Joi.any(),
    comments: Joi.array(),
  };

  return Joi.validate(item, schema);
}

exports.Item = Item;
exports.validate = validateItem;
