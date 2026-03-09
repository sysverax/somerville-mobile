const express = require("express");
const router = express.Router();

const {
  validateAdmin,
  validateRoleBasedHeader,
} = require("../middlewares/auth.middleware");

const productServiceController = require("../controllers/productService.controller");

router.patch(
  "/:id",
  validateAdmin,
  productServiceController.updateProductServiceController,
);

router.patch(
  "/:id/status",
  validateAdmin,
  productServiceController.updateProductServiceStatusController,
);

router.patch(
  "/:id/default",
  validateAdmin,
  productServiceController.resetToDefaultProductServiceController,
);

router.get(
  "/product/:productId",
  validateRoleBasedHeader,
  productServiceController.getServicesForProductController,
);

router.get(
  "/:id/product",
  validateAdmin,
  productServiceController.getProductsForServiceController,
);

module.exports = router;