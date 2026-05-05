const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { asyncHandler, createAudit } = require("./utils");

const DEFAULT_JWT_SECRET = "icn-security-dev-secret";

function signToken(user) {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      role: user.role?.name,
    },
    process.env.JWT_SECRET || DEFAULT_JWT_SECRET,
    { expiresIn: "1d" }
  );
}

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "username болон password шаардлагатай" });
  }

  const user = await User.findOne({ username: username.toLowerCase().trim() })
    .select("+passwordHash")
    .populate("role")
    .populate("employee");

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Нэвтрэх нэр эсвэл нууц үг буруу байна" });
  }

  if (user.status !== "active") {
    return res.status(403).json({ message: "Хэрэглэгч идэвхгүй байна" });
  }

  if (user.expiresAt && user.expiresAt < new Date()) {
    return res.status(403).json({ message: "Хэрэглэгчийн эрхийн хугацаа дууссан байна" });
  }

  user.lastLoginAt = new Date();
  await user.save();
  req.user = user;
  await createAudit(req, "Системд нэвтэрсэн", "users", user._id);

  res.json({
    token: signToken(user),
    user: user.toSafeObject(),
  });
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

module.exports = { login, me };
