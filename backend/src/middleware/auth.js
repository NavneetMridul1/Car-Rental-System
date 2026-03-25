const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Authorization token is required." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden for this role." });
    }
    return next();
  };
}

module.exports = {
  requireAuth,
  requireRole
};
