const jwt = require("jsonwebtoken");
const User = require("../models/User");

const DEFAULT_JWT_SECRET = "icn-security-dev-secret";

async function protect(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Нэвтрэх token байхгүй байна" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || DEFAULT_JWT_SECRET);
    const user = await User.findById(decoded.id).populate("role").populate("employee");

    if (!user || user.status !== "active") {
      return res.status(401).json({ message: "Хэрэглэгч идэвхгүй эсвэл олдсонгүй" });
    }

    if (user.expiresAt && user.expiresAt < new Date()) {
      return res.status(401).json({ message: "Хэрэглэгчийн эрхийн хугацаа дууссан байна" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token хүчингүй байна" });
  }
}

module.exports = { protect };
