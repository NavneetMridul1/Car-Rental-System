require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const carRoutes = require("./routes/carRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const { requireAuth, requireRole } = require("./middleware/auth");
const { getAgencyBookings } = require("./controllers/bookingController");

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Car Rental System API is running.",
    docs: "/api",
    health: "/api/health"
  });
});

app.get("/api", (req, res) => {
  res.json({
    message: "Car Rental System API root",
    endpoints: [
      "GET /api/health",
      "POST /api/auth/register",
      "POST /api/auth/login",
      "GET /api/cars",
      "POST /api/cars",
      "PUT /api/cars/:id",
      "POST /api/bookings",
      "GET /api/bookings/my",
      "GET /api/agency/bookings"
    ]
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/bookings", bookingRoutes);
app.get("/api/agency/bookings", requireAuth, requireRole("AGENCY"), getAgencyBookings);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
