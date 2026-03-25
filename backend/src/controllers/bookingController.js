const pool = require("../config/db");
const { isCarAvailable } = require("../services/bookingService");

function toIsoDateString(dateValue) {
  const date = new Date(dateValue);
  return date.toISOString().slice(0, 10);
}

async function rentCar(req, res) {
  const { car_id, start_date, number_of_days } = req.body;

  if (!car_id || !start_date || !number_of_days) {
    return res.status(400).json({ message: "car_id, start_date, and number_of_days are required." });
  }

  const days = Number(number_of_days);
  if (!Number.isInteger(days) || days <= 0) {
    return res.status(400).json({ message: "number_of_days must be > 0." });
  }

  const today = new Date();
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const start = new Date(start_date);
  const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  if (Number.isNaN(start.getTime()) || startDateOnly < todayDateOnly) {
    return res.status(400).json({ message: "start_date cannot be in the past." });
  }

  try {
    const [cars] = await pool.query("SELECT id, rent_per_day FROM cars WHERE id = ? LIMIT 1", [car_id]);
    if (cars.length === 0) {
      return res.status(404).json({ message: "Car not found." });
    }

    const available = await isCarAvailable(car_id, toIsoDateString(start), days);
    if (!available) {
      return res.status(409).json({ message: "Car is not available for selected dates." });
    }

    const rentPerDay = Number(cars[0].rent_per_day);
    const totalCost = rentPerDay * days;

    const [result] = await pool.query(
      `
      INSERT INTO bookings (car_id, customer_id, start_date, number_of_days, total_cost)
      VALUES (?, ?, ?, ?, ?)
      `,
      [car_id, req.user.userId, toIsoDateString(start), days, totalCost]
    );

    return res.status(201).json({
      message: "Car booked successfully.",
      bookingId: result.insertId,
      totalCost
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create booking." });
  }
}

async function getAgencyBookings(req, res) {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        b.id AS booking_id,
        b.start_date,
        b.number_of_days,
        b.total_cost,
        b.created_at,
        c.id AS car_id,
        c.vehicle_model,
        c.vehicle_number,
        u.id AS customer_id,
        u.name AS customer_name,
        u.email AS customer_email
      FROM bookings b
      JOIN cars c ON c.id = b.car_id
      JOIN users u ON u.id = b.customer_id
      WHERE c.agency_id = ?
      ORDER BY b.id DESC
      `,
      [req.user.userId]
    );

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch agency bookings." });
  }
}

async function getMyBookings(req, res) {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        b.id AS booking_id,
        b.start_date,
        b.number_of_days,
        b.total_cost,
        b.created_at,
        c.id AS car_id,
        c.vehicle_model,
        c.vehicle_number,
        c.seating_capacity,
        c.rent_per_day,
        a.id AS agency_id,
        a.name AS agency_name
      FROM bookings b
      JOIN cars c ON c.id = b.car_id
      JOIN users a ON a.id = c.agency_id
      WHERE b.customer_id = ?
      ORDER BY b.id ASC
      `,
      [req.user.userId]
    );

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch customer bookings." });
  }
}

module.exports = {
  rentCar,
  getAgencyBookings,
  getMyBookings
};
