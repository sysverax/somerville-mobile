const express = require("express");
const router = express.Router();

const {
  validateAdmin,
  validateRoleBasedHeader,
} = require("../middlewares/auth.middleware");
const { uploadCategoryImages } = require("../middlewares/upload.middleware");

const categoryController = require("../controllers/category.controller");

router.post(
  "/",
  validateAdmin,
  uploadCategoryImages,
  categoryController.createCategoryController,
);

router.patch(
  "/:id",
  validateAdmin,
  uploadCategoryImages,
  categoryController.updateCategoryController,
);

router.patch(
  "/:id/status",
  validateAdmin,
  categoryController.updateCategoryStatusController,
);

module.exports = router;
