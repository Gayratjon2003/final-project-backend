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
  author: {
    type: String,
    required: true,
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
    addedBy: {
      type: String,
      required: true,
    },
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
  publishedAt: {
    type: String,
    required: true,
  },
  tags: {
    type: Array,
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
  customFields: {
    fields: {
      type: Array,
      required: false
    },
    values: {
      type: Array,
      required: false
    },
  }
});

const Item = mongoose.model("Item", itemSchema);

function validateItem(item) {
  const schema = {
    name: Joi.string().min(1).max(50).required(),
    author: Joi.string().min(2).max(50).required(),
    collectionId: Joi.string().required(),
    tags: Joi.array().items(Joi.string()),
    values: Joi.array().items(Joi.object()),
    image: Joi.any(),
    comments: Joi.array(),
  };

  return Joi.validate(item, schema);
}

exports.Item = Item;
exports.validate = validateItem;
