const express = require("express");
const router = express.Router();

const {
  validateAdmin,
  validateRoleBasedHeader,
} = require("../middlewares/auth.middleware");

const serviceController = require("../controllers/service.controller");

router.post(
  "/",
  validateAdmin,
  serviceController.createServiceController,
);

router.get(
  "/",
  validateRoleBasedHeader,
  serviceController.getAllServicesController,
);

router.get(
  "/:id",
  validateRoleBasedHeader,
  serviceController.getServiceByIdController,
);

router.patch(
  "/:id",
  validateAdmin,
  serviceController.updateServiceController,
);

router.patch(
  "/:id/status",
  validateAdmin,
  serviceController.updateServiceStatusController,
);

module.exports = router;