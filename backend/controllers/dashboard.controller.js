const Incident = require("../models/Incident");
const AccessLog = require("../models/AccessLog");
const Visitor = require("../models/Visitor");
const Inspection = require("../models/Inspection");
const Notification = require("../models/Notification");
const Employee = require("../models/Employee");
const Department = require("../models/Department");
const Location = require("../models/Location");

const { asyncHandler } = require("./utils");

async function countBy(Model, field) {
  const rows = await Model.aggregate([{ $group: { _id: `$${field}`, count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
  return rows.map((row) => ({ label: row._id || "Тодорхойгүй", count: row.count }));
}

const getStats = asyncHandler(async (req, res) => {
  const [
    incidents,
    accessLogs,
    visitors,
    employees,
    departments,
    locations,
    inspections,
    unreadNotifications,
    recentIncidents,
    recentAccessLogs,
    severityBreakdown,
    typeBreakdown,
  ] = await Promise.all([
    Incident.countDocuments(),
    AccessLog.countDocuments(),
    Visitor.countDocuments(),
    Employee.countDocuments(),
    Department.countDocuments(),
    Location.countDocuments(),
    Inspection.countDocuments(),
    Notification.countDocuments({ status: "unread" }),
    Incident.find().sort({ createdAt: -1 }).limit(5).select("code incidentType severity status locationName createdAt"),
    AccessLog.find().sort({ accessTime: -1 }).limit(5).select("code personName accessType locationName accessTime"),
    countBy(Incident, "severity"),
    countBy(Incident, "incidentType"),
  ]);

  res.json({
    data: {
      incidents,
      accessLogs,
      visitors,
      employees,
      departments,
      locations,
      inspections,
      unreadNotifications,
      pendingIncidents: await Incident.countDocuments({ status: "Хүлээгдэж буй" }),
      insideVisitors: await Visitor.countDocuments({ status: "Байгаа" }),
      severityBreakdown,
      typeBreakdown,
      recentIncidents,
      recentAccessLogs,
    },
  });
});

module.exports = { getStats };
