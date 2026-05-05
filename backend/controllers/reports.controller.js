const Incident = require("../models/Incident");
const AccessLog = require("../models/AccessLog");
const Visitor = require("../models/Visitor");
const Inspection = require("../models/Inspection");
const Notification = require("../models/Notification");
const Employee = require("../models/Employee");
const Report = require("../models/Report");
const { asyncHandler, createAudit, nextCode } = require("./utils");

function mapReport(report) {
  return {
    id: report._id,
    code: report.code,
    title: report.title,
    reportType: report.reportType,
    createdByName: report.createdBy?.fullName || report.createdByName,
    periodStart: report.periodStart,
    periodEnd: report.periodEnd,
    filePath: report.filePath,
    note: report.note,
    metrics: report.metrics,
    createdAt: report.createdAt,
  };
}

async function buildMetrics() {
  const [incidents, accessLogs, visitors, inspections, notifications, employees] = await Promise.all([
    Incident.find(),
    AccessLog.find(),
    Visitor.find(),
    Inspection.find(),
    Notification.find(),
    Employee.find(),
  ]);

  return {
    incidents: {
      total: incidents.length,
      solved: incidents.filter((item) => item.status === "Шийдвэрлэсэн").length,
      pending: incidents.filter((item) => item.status === "Хүлээгдэж буй").length,
    },
    accessLogs: { total: accessLogs.length },
    visitors: {
      total: visitors.length,
      inside: visitors.filter((item) => item.status === "Байгаа").length,
      left: visitors.filter((item) => item.status === "Гарсан").length,
    },
    inspections: {
      total: inspections.length,
      completed: inspections.filter((item) => item.status === "Хийгдсэн").length,
    },
    notifications: {
      total: notifications.length,
      unread: notifications.filter((item) => item.status === "unread").length,
    },
    employees: { total: employees.length },
  };
}

const getReports = asyncHandler(async (req, res) => {
  const reports = await Report.find().populate("createdBy", "fullName username").sort({ createdAt: -1 });
  res.json({ data: reports.map(mapReport), metrics: await buildMetrics() });
});

const createReport = asyncHandler(async (req, res) => {
  const metrics = await buildMetrics();

  const report = await Report.create({
    code: await nextCode(Report, "REP"),
    title: req.body.title || "ICN Security тайлан",
    reportType: req.body.reportType || "custom",
    createdBy: req.user._id,
    createdByName: req.user.fullName,
    periodStart: req.body.periodStart || new Date(),
    periodEnd: req.body.periodEnd || new Date(),
    filePath: req.body.filePath || `/reports/export_${Date.now()}.xlsx`,
    note: req.body.note || "Frontend export хүсэлтээр үүссэн demo report",
    metrics,
  });

  await createAudit(req, "Тайлан үүсгэсэн", "reports", report.code);
  const saved = await Report.findById(report._id).populate("createdBy", "fullName username");
  res.status(201).json({ data: mapReport(saved) });
});

module.exports = { getReports, createReport };
