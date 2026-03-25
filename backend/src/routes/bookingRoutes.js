const express = require("express");
const { rentCar, getAgencyBookings, getMyBookings } = require("../controllers/bookingController");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.post("/", requireAuth, requireRole("CUSTOMER"), rentCar);
router.get("/agency", requireAuth, requireRole("AGENCY"), getAgencyBookings);
router.get("/my", requireAuth, requireRole("CUSTOMER"), getMyBookings);

module.exports = router;
