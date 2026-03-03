
const express = require("express");
const router = express.Router();

const {
  validateAdmin,
  validateRoleBasedHeader,
} = require("../middlewares/auth.middleware");
const { uploadProductImages } = require("../middlewares/upload.middleware");

const productController = require("../controllers/product.controller");

router.post(
  "/",
  validateAdmin,
  uploadProductImages,
  productController.createProductController,
);

router.patch(
  "/:id",
  validateAdmin,
  uploadProductImages,
  productController.updateProductController,
);

router.patch(
  "/:id/status",
  validateAdmin,
  productController.updateProductStatusController,
);

router.get(
  "/",
  validateRoleBasedHeader,
  productController.getAllProductsController,
);

router.get(
  "/:id",
  validateRoleBasedHeader,
  productController.getProductByIdController,
);

router.delete(
  "/:id",
  validateAdmin,
  productController.deleteProductController,
);

module.exports = router;

