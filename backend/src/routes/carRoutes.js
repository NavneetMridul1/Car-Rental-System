const express = require("express");
const { getAllCars, addCar, editCar } = require("../controllers/carController");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", getAllCars);
router.post("/", requireAuth, requireRole("AGENCY"), addCar);
router.put("/:id", requireAuth, requireRole("AGENCY"), editCar);

module.exports = router;
