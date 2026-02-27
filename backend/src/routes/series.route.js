const express = require("express");
const router = express.Router();

const {
  validateAdmin,
  validateRoleBasedHeader,
} = require("../middlewares/auth.middleware");
const { uploadSeriesImages } = require("../middlewares/upload.middleware");

const seriesController = require("../controllers/series.controller");

router.post(
  "/",
  validateAdmin,
  uploadSeriesImages,
  seriesController.createSeriesController,
);

router.patch(
  "/:id",
  validateAdmin,
  uploadSeriesImages,
  seriesController.updateSeriesController,
);

router.patch(
  "/:id/status",
  validateAdmin,
  seriesController.updateSeriesStatusController,
);

router.get(
  "/",
  validateRoleBasedHeader,
  seriesController.getAllSeriesController,
);

router.get(
  "/:id",
  validateRoleBasedHeader,
  seriesController.getSeriesByIdController,
);

router.delete("/:id", validateAdmin, seriesController.deleteSeriesController);

module.exports = router;
