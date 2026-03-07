const express = require("express");
const router = express.Router();

const {
  validateAdmin,
  validateRoleBasedHeader,
} = require("../middlewares/auth.middleware");
const { uploadSeriesImages } = require("../middlewares/upload.middleware");

const serviceController = require("../controllers/service.controller");

router.post(
  "/",
  validateAdmin,
  serviceController.createServiceController,
);

module.exports = router;