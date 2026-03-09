const express = require("express");
const router = express.Router();

const { validateAdmin } = require("../middlewares/auth.middleware");
const bookingController = require("../controllers/booking.controller");

router.post("/", bookingController.createBookingController);

router.get("/", validateAdmin, bookingController.getAllBookingsController);

module.exports = router;
