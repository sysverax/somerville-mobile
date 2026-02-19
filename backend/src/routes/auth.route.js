const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");

router.post("/admin/register", authController.adminRegisterController);
router.post("/admin/login", authController.adminLoginController);
module.exports = router;
