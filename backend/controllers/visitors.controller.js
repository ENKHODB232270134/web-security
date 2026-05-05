const Visitor = require("../models/Visitor");
const { asyncHandler, createAudit, nextCode, resolveEmployee } = require("./utils");

function mapVisitor(doc) {
  const item = doc.toObject();
  return {
    id: item._id,
    code: item.code,
    date: item.visitDate,
    firstName: item.firstName,
    lastName: item.lastName,
    registerNo: item.registerNo,
    organisationName: item.organisationName,
    purpose: item.purpose,
    responsibleName: item.responsibleEmployee
      ? `${item.responsibleEmployee.firstName} ${item.responsibleEmployee.lastName || ""}`.trim()
      : item.responsibleName,
    schedule: item.schedule,
    status: item.status,
  };
}

const getVisitors = asyncHandler(async (req, res) => {
  const visitors = await Visitor.find().populate("responsibleEmployee").sort({ createdAt: -1 });
  res.json({ data: visitors.map(mapVisitor) });
});

const createVisitor = asyncHandler(async (req, res) => {
  const responsible = await resolveEmployee(req.body.responsibleEmployee || req.body.responsibleName);

  const visitor = await Visitor.create({
    code: await nextCode(Visitor, "VIS"),
    firstName: req.body.firstName || "Тодорхойгүй",
    lastName: req.body.lastName || "",
    registerNo: req.body.registerNo || "",
    organisationName: req.body.organisationName || "",
    phone: req.body.phone || "",
    email: req.body.email || "",
    purpose: req.body.purpose || "—",
    responsibleEmployee: responsible.employee,
    responsibleName: responsible.employeeName,
    schedule: req.body.schedule || "Урьдчилсан бүртгэлгүй",
    status: req.body.status || "Байгаа",
    visitDate: req.body.visitDate || new Date(),
  });

  await createAudit(req, "Зочин бүртгэсэн", "visitors", visitor.code);
  const saved = await Visitor.findById(visitor._id).populate("responsibleEmployee");
  res.status(201).json({ data: mapVisitor(saved) });
});

const updateVisitor = asyncHandler(async (req, res) => {
  const visitor = await Visitor.findById(req.params.id);
  if (!visitor) return res.status(404).json({ message: "Зочин олдсонгүй" });

  const responsible = await resolveEmployee(req.body.responsibleEmployee || req.body.responsibleName);

  visitor.firstName = req.body.firstName || visitor.firstName;
  visitor.lastName = req.body.lastName ?? visitor.lastName;
  visitor.registerNo = req.body.registerNo ?? visitor.registerNo;
  visitor.organisationName = req.body.organisationName ?? visitor.organisationName;
  visitor.purpose = req.body.purpose || visitor.purpose;
  visitor.responsibleEmployee = responsible.employee || visitor.responsibleEmployee;
  visitor.responsibleName = responsible.employeeName || visitor.responsibleName;
  visitor.schedule = req.body.schedule || visitor.schedule;
  visitor.status = req.body.status || visitor.status;

  await visitor.save();
  await createAudit(req, "Зочин шинэчилсэн", "visitors", visitor.code);
  const saved = await Visitor.findById(visitor._id).populate("responsibleEmployee");
  res.json({ data: mapVisitor(saved) });
});

const deleteVisitor = asyncHandler(async (req, res) => {
  const visitor = await Visitor.findByIdAndDelete(req.params.id);
  if (!visitor) return res.status(404).json({ message: "Зочин олдсонгүй" });

  await createAudit(req, "Зочин устгасан", "visitors", visitor.code);
  res.json({ message: "Зочин устгагдлаа" });
});

module.exports = { getVisitors, createVisitor, updateVisitor, deleteVisitor };
