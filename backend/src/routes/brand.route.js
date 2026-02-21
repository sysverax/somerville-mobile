const express = require("express");
const router = express.Router();

const {
  validateAdmin,
  validateRoleBasedHeader,
} = require("../middlewares/auth.middleware");
const { uploadBrandImages } = require("../middlewares/upload.middleware");

const brandController = require("../controllers/brand.controller");

router.post(
  "/",
  validateAdmin,
  uploadBrandImages,
  brandController.createBrandController,
);

router.get(
  "/",
  validateRoleBasedHeader,
  brandController.getAllBrandsController,
);
router.get(
  "/:id",
  validateRoleBasedHeader,
  brandController.getBrandByIdController,
);
router.patch(
  "/:id",
  validateAdmin,
  uploadBrandImages,
  brandController.updateBrandController,
);
router.patch(
  "/:id/status",
  validateAdmin,
  brandController.updateBrandStatusController,
);
router.delete("/:id", validateAdmin, brandController.deleteBrandController);

module.exports = router;
