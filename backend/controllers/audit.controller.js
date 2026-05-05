const AuditLog = require("../models/AuditLog");
const User = require("../models/User");
const { asyncHandler } = require("./utils");

const getAuditLogs = asyncHandler(async (req, res) => {
  const logs = await AuditLog.find().populate("user", "username fullName").sort({ createdAt: -1 }).limit(200);
  const today = new Date().toISOString().slice(0, 10);
  const usersCount = await User.countDocuments();

  res.json({
    data: logs.map((log) => ({
      id: log._id,
      createdAt: log.createdAt,
      username: log.user?.username || log.username,
      userFullName: log.user?.fullName || log.userFullName,
      actionType: log.actionType,
      entityName: log.entityName,
      entityId: log.entityId,
      ipAddress: log.ipAddress,
    })),
    stats: {
      total: await AuditLog.countDocuments(),
      today: await AuditLog.countDocuments({
        createdAt: {
          $gte: new Date(`${today}T00:00:00.000Z`),
        },
      }),
      users: usersCount,
    },
  });
});

module.exports = { getAuditLogs };
