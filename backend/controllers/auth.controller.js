const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");
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

function makeUsername(email) {
  return String(email || "")
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/g, "")
    .slice(0, 24);
}

const register = asyncHandler(async (req, res) => {
  const { name, fullName, email, password, role } = req.body;

  if (!email || !password || !(name || fullName)) {
    return res.status(400).json({ message: "name, email, password шаардлагатай" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Нууц үг хамгийн багадаа 6 тэмдэгт байна" });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return res.status(409).json({ message: "Энэ email аль хэдийн бүртгэлтэй байна" });
  }

  const requestedRole = await Role.findOne({ name: role || "viewer" });
  const safeRole = requestedRole || (await Role.findOne({ name: "viewer" }));
  const baseUsername = makeUsername(normalizedEmail) || `user${Date.now()}`;
  const usernameTaken = await User.exists({ username: baseUsername });

  const user = await User.create({
    username: usernameTaken ? `${baseUsername}${Date.now().toString().slice(-4)}` : baseUsername,
    email: normalizedEmail,
    passwordHash: password,
    fullName: fullName || name,
    role: safeRole._id,
    status: "active",
  });

  const populatedUser = await User.findById(user._id).populate("role").populate("employee");
  req.user = populatedUser;
  await createAudit(req, "Хэрэглэгч бүртгүүлсэн", "users", user._id);

  res.status(201).json({
    token: signToken(populatedUser),
    user: populatedUser.toSafeObject(),
  });
});

const login = asyncHandler(async (req, res) => {
  const loginId = req.body.email || req.body.username;
  const { password } = req.body;

  if (!loginId || !password) {
    return res.status(400).json({ message: "email/username болон password шаардлагатай" });
  }

  const normalizedLogin = loginId.toLowerCase().trim();
  const user = await User.findOne({
    $or: [{ email: normalizedLogin }, { username: normalizedLogin }],
  })
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

module.exports = { register, login, me };
