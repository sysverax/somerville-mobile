const express = require("express");
const router = express.Router();
const { validateAdmin } = require("../middlewares/auth.middleware");
const authController = require("../controllers/auth.controller");

router.post("/admin/register", authController.adminRegisterController);
router.post("/admin/login", authController.adminLoginController);
router.post("/admin/logout", validateAdmin, authController.adminLogoutController);
router.post(
  "/admin/validate-session",
  validateAdmin,
  authController.validateAdminSessionController,
);
module.exports = router;
