const Notification = require("../models/Notification");
const User = require("../models/User");
const { asyncHandler, createAudit } = require("./utils");

function mapNotification(notification) {
  const item = notification.toObject();
  return {
    id: item._id,
    title: item.title,
    message: item.message,
    type: item.type,
    status: item.status,
    read: item.status === "read",
    userName: item.user?.fullName || "",
    incidentCode: item.incident?.code || "",
    sentByName: item.sentBy?.fullName || item.sentByName,
    sentAt: item.sentAt,
    readAt: item.readAt,
  };
}

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find()
    .populate("user", "fullName username")
    .populate("incident", "code")
    .populate("sentBy", "fullName username")
    .sort({ sentAt: -1 });

  res.json({ data: notifications.map(mapNotification) });
});

const createNotification = asyncHandler(async (req, res) => {
  const targetUser = req.body.userId ? await User.findById(req.body.userId) : null;

  const notification = await Notification.create({
    title: req.body.title || "Шинэ мэдэгдэл",
    message: req.body.message || "—",
    type: req.body.type || "Мэдээлэл",
    user: targetUser?._id || null,
    sentBy: req.user._id,
    sentByName: req.user.fullName,
  });

  await createAudit(req, "Мэдэгдэл илгээсэн", "notifications", notification._id);
  const saved = await Notification.findById(notification._id).populate("user").populate("incident").populate("sentBy");
  res.status(201).json({ data: mapNotification(saved) });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) return res.status(404).json({ message: "Мэдэгдэл олдсонгүй" });

  notification.status = "read";
  notification.readAt = new Date();
  await notification.save();

  res.json({ data: mapNotification(notification) });
});

module.exports = { getNotifications, createNotification, markNotificationRead };
