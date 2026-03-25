const pool = require("../config/db");

async function getAllCars(req, res) {
  try {
    const [rows] = await pool.query(
      `
      SELECT c.id, c.vehicle_model, c.vehicle_number, c.car_image_url, c.seating_capacity, c.rent_per_day, c.agency_id, u.name AS agency_name
      FROM cars c
      JOIN users u ON u.id = c.agency_id
      ORDER BY c.id DESC
      `
    );
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch cars." });
  }
}

async function addCar(req, res) {
  const { vehicle_model, vehicle_number, car_image_url, seating_capacity, rent_per_day } = req.body;

  if (!vehicle_model || !vehicle_number || !car_image_url || !seating_capacity || !rent_per_day) {
    return res.status(400).json({ message: "All car fields are required." });
  }

  try {
    const [existing] = await pool.query(
      "SELECT id FROM cars WHERE vehicle_number = ? LIMIT 1",
      [vehicle_number]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "Vehicle number already exists." });
    }

    const [result] = await pool.query(
      `
      INSERT INTO cars (agency_id, vehicle_model, vehicle_number, car_image_url, seating_capacity, rent_per_day)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [req.user.userId, vehicle_model, vehicle_number, car_image_url, Number(seating_capacity), Number(rent_per_day)]
    );

    return res.status(201).json({ message: "Car added successfully.", carId: result.insertId });
  } catch (error) {
    return res.status(500).json({ message: "Failed to add car." });
  }
}

async function editCar(req, res) {
  const { id } = req.params;
  const { vehicle_model, vehicle_number, car_image_url, seating_capacity, rent_per_day } = req.body;

  if (!vehicle_model || !vehicle_number || !car_image_url || !seating_capacity || !rent_per_day) {
    return res.status(400).json({ message: "All car fields are required." });
  }

  try {
    const [cars] = await pool.query("SELECT * FROM cars WHERE id = ? LIMIT 1", [id]);
    if (cars.length === 0) {
      return res.status(404).json({ message: "Car not found." });
    }

    const car = cars[0];
    if (car.agency_id !== req.user.userId) {
      return res.status(403).json({ message: "You can edit only your own cars." });
    }

    const [existing] = await pool.query(
      "SELECT id FROM cars WHERE vehicle_number = ? AND id <> ? LIMIT 1",
      [vehicle_number, id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "Vehicle number already exists." });
    }

    await pool.query(
      `
      UPDATE cars
      SET vehicle_model = ?, vehicle_number = ?, car_image_url = ?, seating_capacity = ?, rent_per_day = ?
      WHERE id = ?
      `,
      [vehicle_model, vehicle_number, car_image_url, Number(seating_capacity), Number(rent_per_day), id]
    );

    return res.json({ message: "Car updated successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update car." });
  }
}

module.exports = {
  getAllCars,
  addCar,
  editCar
};
