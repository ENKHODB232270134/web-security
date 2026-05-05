const Incident = require("../models/Incident");
const Notification = require("../models/Notification");
const { asyncHandler, createAudit, nextCode, resolveLocation, resolveEmployee } = require("./utils");

function mapIncident(doc) {
  const item = doc.toObject();
  return {
    id: item._id,
    code: item.code,
    date: item.occurredAt,
    createdAt: item.createdAt,
    incidentType: item.incidentType,
    type: item.incidentType,
    category: item.category,
    locationName: item.location?.name || item.locationName,
    severity: item.severity,
    status: item.status,
    reportedByName: item.reportedBy?.fullName || item.reportedByName,
    assignedToName: item.assignedTo
      ? `${item.assignedTo.firstName} ${item.assignedTo.lastName || ""}`.trim()
      : item.assignedToName,
    description: item.description,
    dueDate: item.dueDate,
  };
}

const getIncidents = asyncHandler(async (req, res) => {
  const incidents = await Incident.find()
    .populate("location")
    .populate("reportedBy", "fullName username")
    .populate("assignedTo")
    .sort({ createdAt: -1 });

  res.json({ data: incidents.map(mapIncident) });
});

const createIncident = asyncHandler(async (req, res) => {
  const { location, locationName } = await resolveLocation(req.body);
  const assigned = await resolveEmployee(req.body.assignedTo || req.body.assignedToName);

  const incident = await Incident.create({
    code: await nextCode(Incident, "INC"),
    incidentType: req.body.incidentType || req.body.type || "Бусад",
    category: req.body.category || "Ерөнхий",
    location,
    locationName,
    severity: req.body.severity || "Дунд",
    status: req.body.status || "Хүлээгдэж буй",
    reportedBy: req.user._id,
    reportedByName: req.user.fullName,
    assignedTo: assigned.employee,
    assignedToName: assigned.employeeName,
    description: req.body.description || "",
    occurredAt: req.body.occurredAt || new Date(),
    dueDate: req.body.dueDate || null,
  });

  await Notification.create({
    title: `Шинэ зөрчил: ${incident.incidentType}`,
    message: `${incident.locationName || "Байршил тодорхойгүй"} — ${incident.severity}`,
    type: incident.severity === "Нэн яаралтай" ? "Яаралтай" : "Анхааруулга",
    incident: incident._id,
    sentBy: req.user._id,
    sentByName: req.user.fullName,
  });

  await createAudit(req, "Зөрчил бүртгэсэн", "incidents", incident.code);
  const saved = await Incident.findById(incident._id).populate("location").populate("reportedBy").populate("assignedTo");

  res.status(201).json({ data: mapIncident(saved) });
});

const updateIncident = asyncHandler(async (req, res) => {
  const incident = await Incident.findById(req.params.id);
  if (!incident) return res.status(404).json({ message: "Зөрчил олдсонгүй" });

  const { location, locationName } = await resolveLocation(req.body);
  const assigned = await resolveEmployee(req.body.assignedTo || req.body.assignedToName);

  incident.incidentType = req.body.incidentType || req.body.type || incident.incidentType;
  incident.category = req.body.category || incident.category;
  incident.location = location || incident.location;
  incident.locationName = locationName || incident.locationName;
  incident.severity = req.body.severity || incident.severity;
  incident.status = req.body.status || incident.status;
  incident.assignedTo = assigned.employee || incident.assignedTo;
  incident.assignedToName = assigned.employeeName || incident.assignedToName;
  incident.description = req.body.description ?? incident.description;
  incident.dueDate = req.body.dueDate || incident.dueDate;

  await incident.save();
  await createAudit(req, "Зөрчил шинэчилсэн", "incidents", incident.code);
  const saved = await Incident.findById(incident._id).populate("location").populate("reportedBy").populate("assignedTo");

  res.json({ data: mapIncident(saved) });
});

const deleteIncident = asyncHandler(async (req, res) => {
  const incident = await Incident.findByIdAndDelete(req.params.id);
  if (!incident) return res.status(404).json({ message: "Зөрчил олдсонгүй" });

  await createAudit(req, "Зөрчил устгасан", "incidents", incident.code);
  res.json({ message: "Зөрчил устгагдлаа" });
});

module.exports = { getIncidents, createIncident, updateIncident, deleteIncident };
