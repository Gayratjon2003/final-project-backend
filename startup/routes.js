const express = require("express");
const errorMiddleware = require("../middleware/error");
const usersRoute = require("../routes/users");
const authRoute = require("../routes/auth");
const itemsRoute = require("../routes/items");
const commentRoute = require("../routes/comment");
const likeRoute = require("../routes/like");
const categoryRoute = require("../routes/categories");
const collectionRoute = require("../routes/collections");
const uploadRoute = require("../routes/upload");
const cors = require("cors");
const fileupload = require("express-fileupload");

module.exports = function (app) {
  app.use(cors());
  app.use(express.json({limit: '50mb'}));
  app.use(fileupload());
  app.use("/api/users", usersRoute);
  app.use("/api/auth", authRoute);
  app.use("/api/items", itemsRoute);
  app.use("/api/comment", commentRoute);
  app.use("/api/like", likeRoute);
  app.use("/api/categories", categoryRoute);
  app.use("/api/collections", collectionRoute);
  app.use("/api/upload", uploadRoute);
  app.use(errorMiddleware);
};
