const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const VALID_ROLES = ["CUSTOMER", "AGENCY"];

async function register(req, res) {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "name, email, password, and role are required." });
  }

  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ message: "Invalid role." });
  }

  try {
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role]
    );

    return res.status(201).json({
      message: "User created",
      user: {
        id: result.insertId,
        name,
        email,
        role
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error during registration." });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required." });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error during login." });
  }
}

module.exports = {
  register,
  login
};
