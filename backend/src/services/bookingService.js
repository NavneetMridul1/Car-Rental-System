const pool = require("../config/db");

async function isCarAvailable(carId, startDate, numberOfDays) {
  const [rows] = await pool.query(
    `
    SELECT id
    FROM bookings
    WHERE car_id = ?
      AND start_date < DATE_ADD(?, INTERVAL ? DAY)
      AND DATE_ADD(start_date, INTERVAL number_of_days DAY) > ?
    LIMIT 1
    `,
    [carId, startDate, numberOfDays, startDate]
  );

  return rows.length === 0;
}

module.exports = {
  isCarAvailable
};
