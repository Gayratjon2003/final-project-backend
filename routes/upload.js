const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const cloudinary = require("../utils/cloudinary");

router.post("/collection", [auth, admin], async (req, res) => {
  const result = await cloudinary.uploader.upload(req.body.image, {
    folder: "collection",
  });
  res.send({publicId: result.public_id, url: result.secure_url});
});

module.exports = router;
