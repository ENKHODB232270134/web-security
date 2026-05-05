const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("../config/db");
const Role = require("../models/Role");
const User = require("../models/User");
const Employee = require("../models/Employee");
const Department = require("../models/Department");
const Location = require("../models/Location");
const Incident = require("../models/Incident");
const AccessLog = require("../models/AccessLog");
const Visitor = require("../models/Visitor");
const Inspection = require("../models/Inspection");
const Notification = require("../models/Notification");
const Report = require("../models/Report");
const AuditLog = require("../models/AuditLog");
const Attachment = require("../models/Attachment");
const Permit = require("../models/Permit");

function daysAgo(days, hour = 9, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date;
}

async function clearDatabase() {
  await Promise.all([
    User.deleteMany(),
    Role.deleteMany(),
    Employee.deleteMany(),
    Department.deleteMany(),
    Location.deleteMany(),
    Incident.deleteMany(),
    AccessLog.deleteMany(),
    Visitor.deleteMany(),
    Inspection.deleteMany(),
    Notification.deleteMany(),
    Report.deleteMany(),
    AuditLog.deleteMany(),
    Attachment.deleteMany(),
    Permit.deleteMany(),
  ]);
}

async function seed() {
  await connectDB();
  await clearDatabase();

  const roles = await Role.insertMany([
    {
      name: "admin",
      label: "Системийн Админ",
      description: "Бүрэн эрх — бүх модульд хандалт",
      permissions: ["*"],
    },
    {
      name: "security_manager",
      label: "Аюулгүй байдлын Менежер",
      description: "Шийдвэрлэлт хянах, тайлан гаргах",
      permissions: ["dashboard:read", "incidents:*", "visitors:*", "access_logs:*", "reports:*", "audit:read"],
    },
    {
      name: "shift_supervisor",
      label: "Ээлжийн Ахлах",
      description: "Бүртгэл шалгах, батлах, буцаах",
      permissions: ["dashboard:read", "incidents:*", "visitors:*", "access_logs:*", "inspections:*"],
    },
    {
      name: "security_staff",
      label: "Хамгаалалтын Ажилтан",
      description: "Бүртгэл үүсгэх, өөрийн мэдээлэл харах",
      permissions: ["dashboard:read", "incidents:create", "visitors:create", "access_logs:create", "inspections:create"],
    },
    {
      name: "viewer",
      label: "Удирдлага",
      description: "Тайлан, статистик харах — зөвхөн хянах",
      permissions: ["dashboard:read", "reports:read"],
    },
  ]);

  const roleByName = Object.fromEntries(roles.map((role) => [role.name, role]));

  const departments = await Department.insertMany([
    { code: "SEC", name: "Аюулгүй байдлын алба", description: "Объектын хамгаалалт, бүртгэл, хяналт" },
    { code: "IT", name: "Мэдээллийн технологи", description: "Программ, сервер, мэдээллийн сангийн хэвийн ажиллагаа" },
    { code: "TECH", name: "Техникийн алба", description: "Сүлжээний тоног төхөөрөмж, засвар" },
    { code: "CS", name: "Хэрэглэгчийн үйлчилгээ", description: "Гэрээ, тооцоо, санал гомдол" },
    { code: "HR", name: "Хүний нөөц", description: "Ажилтны сонгон шалгаруулалт, сургалт" },
    { code: "MGMT", name: "Удирдлага", description: "Стратеги төлөвлөлт, удирдлага" },
  ]);

  const deptByCode = Object.fromEntries(departments.map((department) => [department.code, department]));

  const locations = await Location.insertMany([
    { code: "LOC-001", name: "Үндсэн орц", type: "Орц/Гарц", address: "1-р байр, гол хаалга", description: "Үндсэн нэвтрэх хаалга" },
    { code: "LOC-002", name: "Хойд орц", type: "Орц/Гарц", address: "Хойд хэсэг", description: "Хойд талын нэвтрэх хаалга" },
    { code: "LOC-003", name: "Баруун орц", type: "Орц/Гарц", address: "Баруун хэсэг", description: "Баруун талын нэвтрэх хаалга" },
    { code: "LOC-004", name: "А корпус — 1 дав", type: "Барилга", address: "А корпус, 1-р давхар", description: "Ажлын өрөөнүүд" },
    { code: "LOC-005", name: "А корпус — 2 дав", type: "Барилга", address: "А корпус, 2-р давхар", description: "Удирдлагын өрөөнүүд" },
    { code: "LOC-006", name: "Серверийн өрөө", type: "Тусгай зон", address: "Б корпус, -1 давхар", description: "Хязгаарлагдмал хандалттай өрөө" },
    { code: "LOC-007", name: "Б корпус", type: "Барилга", address: "Б корпус, бүх давхар", description: "Техникийн ажилтнуудын байр" },
    { code: "LOC-008", name: "Гадна хашаа", type: "Гадна талбай", address: "Хашааны периметр", description: "Гадна хамгаалалтын зона" },
    { code: "LOC-009", name: "Тоног төхөөрөмжийн өрөө", type: "Тусгай зон", address: "В корпус, 1-р давхар", description: "Сүлжээний тоног төхөөрөмж" },
    { code: "LOC-010", name: "Машины зогсоол", type: "Гадна талбай", address: "Баруун хойд булан", description: "Ажилчид, зочдын машины зогсоол" },
  ]);

  const locByCode = Object.fromEntries(locations.map((location) => [location.code, location]));

  const employees = await Employee.insertMany([
    { employeeCode: "EMP-001", firstName: "franz", lastName: "", department: deptByCode.IT._id, position: "Системийн Админ", phone: "9900-0001", email: "admin@icn.mn", hireDate: daysAgo(1400) },
    { employeeCode: "EMP-002", firstName: "О.", lastName: "Жанцанноров", department: deptByCode.SEC._id, position: "АБ Менежер", phone: "9900-0002", email: "manager@icn.mn", hireDate: daysAgo(1600) },
    { employeeCode: "EMP-003", firstName: "О.", lastName: "Гэрэлт-Од", department: deptByCode.SEC._id, position: "Хамгаалалтын Ажилтан", phone: "9900-0003", email: "staff@icn.mn", hireDate: daysAgo(900) },
    { employeeCode: "EMP-004", firstName: "О.", lastName: "Энх-Од", department: deptByCode.SEC._id, position: "Ээлжийн Ахлах", phone: "9900-0004", email: "leader@icn.mn", hireDate: daysAgo(1100) },
    { employeeCode: "EMP-005", firstName: "Б.", lastName: "Мөнхбат", department: deptByCode.SEC._id, position: "Хамгаалалтын Ажилтан", phone: "9900-0005", email: "munkh@icn.mn", hireDate: daysAgo(700) },
    { employeeCode: "EMP-006", firstName: "Д.", lastName: "Эрдэнэ", department: deptByCode.SEC._id, position: "Хамгаалалтын Ажилтан", phone: "9900-0006", email: "erdene@icn.mn", hireDate: daysAgo(650) },
    { employeeCode: "EMP-007", firstName: "Г.", lastName: "Батсайхан", department: deptByCode.IT._id, position: "IT Инженер", phone: "9900-0007", email: "it@icn.mn", hireDate: daysAgo(1000) },
    { employeeCode: "EMP-008", firstName: "Э.", lastName: "Мөнхтуяа", department: deptByCode.TECH._id, position: "Холбооны Инженер", phone: "9900-0008", email: "eng@icn.mn", hireDate: daysAgo(1800) },
  ]);

  const emp = Object.fromEntries(employees.map((employee) => [employee.employeeCode, employee]));

  const users = await User.create([
    {
      username: "admin",
      passwordHash: "admin123",
      fullName: "franz",
      role: roleByName.admin._id,
      employee: emp["EMP-001"]._id,
      status: "active",
    },
    {
      username: "manager",
      passwordHash: "manager123",
      fullName: "О.Жанцанноров",
      role: roleByName.security_manager._id,
      employee: emp["EMP-002"]._id,
      status: "active",
    },
    {
      username: "staff",
      passwordHash: "staff123",
      fullName: "О.Гэрэлт-Од",
      role: roleByName.security_staff._id,
      employee: emp["EMP-003"]._id,
      status: "active",
    },
    {
      username: "leader",
      passwordHash: "leader123",
      fullName: "О.Энх-Од",
      role: roleByName.shift_supervisor._id,
      employee: emp["EMP-004"]._id,
      status: "active",
    },
  ]);

  const userByName = Object.fromEntries(users.map((user) => [user.username, user]));

  const incidents = await Incident.insertMany([
    {
      code: "INC-041",
      incidentType: "Хаалга нээлттэй үлдсэн",
      location: locByCode["LOC-005"]._id,
      locationName: locByCode["LOC-005"].name,
      severity: "Нэн яаралтай",
      status: "Хүлээгдэж буй",
      reportedBy: userByName.staff._id,
      reportedByName: "О.Гэрэлт-Од",
      assignedTo: emp["EMP-002"]._id,
      assignedToName: "О.Жанцанноров",
      description: "А корпусын 2 давхарт хаалга нээлттэй байгааг илрүүлэв.",
      occurredAt: daysAgo(0, 8, 32),
      dueDate: daysAgo(-1),
    },
    {
      code: "INC-040",
      incidentType: "Камер ажиллахгүй",
      location: locByCode["LOC-001"]._id,
      locationName: locByCode["LOC-001"].name,
      severity: "Дунд",
      status: "Шийдвэрлэж байна",
      reportedBy: userByName.leader._id,
      reportedByName: "О.Энх-Од",
      assignedTo: emp["EMP-007"]._id,
      assignedToName: "Г.Батсайхан",
      description: "Үндсэн орцны камер доголдов.",
      occurredAt: daysAgo(1, 22, 14),
      dueDate: daysAgo(-2),
    },
    {
      code: "INC-039",
      incidentType: "Зөвшөөрөлгүй нэвтрэлт",
      location: locByCode["LOC-006"]._id,
      locationName: locByCode["LOC-006"].name,
      severity: "Нэн яаралтай",
      status: "Шийдвэрлэсэн",
      reportedBy: userByName.staff._id,
      reportedByName: "О.Гэрэлт-Од",
      assignedTo: emp["EMP-002"]._id,
      assignedToName: "О.Жанцанноров",
      description: "Серверийн өрөөнд зөвшөөрөлгүй нэвтрэлт илэрлээ.",
      occurredAt: daysAgo(2, 14, 5),
      dueDate: daysAgo(2),
    },
    {
      code: "INC-038",
      incidentType: "Хашааны гэмтэл",
      location: locByCode["LOC-008"]._id,
      locationName: locByCode["LOC-008"].name,
      severity: "Бага",
      status: "Шийдвэрлэсэн",
      reportedBy: userByName.admin._id,
      reportedByName: "franz",
      assignedTo: emp["EMP-008"]._id,
      assignedToName: "Э.Мөнхтуяа",
      description: "Баруун хашааны хэсэг гэмтжээ.",
      occurredAt: daysAgo(3, 10, 20),
    },
  ]);

  const visitors = await Visitor.insertMany([
    {
      code: "VIS-088",
      firstName: "Г.",
      lastName: "Батцэцэг",
      organisationName: "Монгол Телеком",
      registerNo: "ТА12345678",
      purpose: "Уулзалт",
      responsibleEmployee: emp["EMP-002"]._id,
      responsibleName: "О.Жанцанноров",
      schedule: "Урьдчилсан бүртгэлтэй",
      status: "Байгаа",
      visitDate: daysAgo(0, 10, 15),
      permit: {
        permitNumber: "PER-001",
        validFrom: daysAgo(0, 9, 0),
        validUntil: daysAgo(-1, 18, 0),
        approvedByName: "О.Жанцанноров",
      },
    },
    {
      code: "VIS-087",
      firstName: "Т.",
      lastName: "Болд",
      organisationName: "Шилэн Кабел",
      registerNo: "ОД87654321",
      purpose: "Засвар үйлчилгээ",
      responsibleEmployee: emp["EMP-001"]._id,
      responsibleName: "franz",
      status: "Байгаа",
      visitDate: daysAgo(0, 9, 30),
    },
    {
      code: "VIS-086",
      firstName: "Н.",
      lastName: "Сарантуяа",
      organisationName: "Хувь хүн",
      registerNo: "ТА11223344",
      purpose: "Баримт бичиг авах",
      responsibleEmployee: emp["EMP-003"]._id,
      responsibleName: "О.Гэрэлт-Од",
      status: "Гарсан",
      visitDate: daysAgo(1, 14, 0),
    },
  ]);

  await AccessLog.insertMany([
    {
      code: "ALG-201",
      personType: "Ажилтан",
      personName: "О.Гэрэлт-Од",
      position: "Хамгаалалтын Ажилтан",
      employee: emp["EMP-003"]._id,
      location: locByCode["LOC-001"]._id,
      locationName: "Үндсэн орц",
      accessType: "Нэвтэрсэн",
      accessTime: daysAgo(0, 8, 45),
      approvedBy: emp["EMP-004"]._id,
      approvedByName: "О.Энх-Од",
    },
    {
      code: "ALG-200",
      personType: "Ажилтан",
      personName: "О.Жанцанноров",
      position: "АБ Менежер",
      employee: emp["EMP-002"]._id,
      location: locByCode["LOC-001"]._id,
      locationName: "Үндсэн орц",
      accessType: "Нэвтэрсэн",
      accessTime: daysAgo(0, 8, 30),
      approvedBy: emp["EMP-004"]._id,
      approvedByName: "О.Энх-Од",
    },
    {
      code: "ALG-199",
      personType: "Зочин",
      personName: "Г.Батцэцэг",
      position: "Зочин",
      visitor: visitors[0]._id,
      location: locByCode["LOC-001"]._id,
      locationName: "Үндсэн орц",
      accessType: "Нэвтэрсэн",
      accessTime: daysAgo(0, 10, 15),
      approvedBy: emp["EMP-002"]._id,
      approvedByName: "О.Жанцанноров",
      note: "Монгол Телеком — уулзалт",
    },
    {
      code: "ALG-198",
      personType: "Ажилтан",
      personName: "Б.Мөнхбат",
      position: "Хамгаалалтын Ажилтан",
      employee: emp["EMP-005"]._id,
      location: locByCode["LOC-001"]._id,
      locationName: "Үндсэн орц",
      accessType: "Гарсан",
      accessTime: daysAgo(1, 18, 5),
      approvedBy: emp["EMP-004"]._id,
      approvedByName: "О.Энх-Од",
      note: "Ээлж дуусгасан",
    },
  ]);

  await Inspection.insertMany([
    {
      code: "INS-312",
      inspectionType: "Эргүүл шалгалт",
      location: locByCode["LOC-004"]._id,
      locationName: "А корпус — 1 дав",
      inspectedBy: emp["EMP-003"]._id,
      inspectedByName: "О.Гэрэлт-Од",
      approvedBy: emp["EMP-004"]._id,
      approvedByName: "О.Энх-Од",
      inspectionDate: daysAgo(0, 8, 0),
      durationMinutes: 45,
      notes: "Ямар нэг зөрчилгүй",
      status: "Хийгдсэн",
      checklistItems: [
        { title: "Хаалга түгжээ", passed: true },
        { title: "Камер ажиллагаа", passed: true },
      ],
    },
    {
      code: "INS-311",
      inspectionType: "Постын хяналт",
      location: locByCode["LOC-001"]._id,
      locationName: "Үндсэн орц",
      inspectedBy: emp["EMP-005"]._id,
      inspectedByName: "Б.Мөнхбат",
      approvedBy: emp["EMP-004"]._id,
      approvedByName: "О.Энх-Од",
      inspectionDate: daysAgo(0, 6, 0),
      durationMinutes: 40,
      notes: "Хэвийн",
      status: "Хийгдсэн",
    },
    {
      code: "INS-310",
      inspectionType: "Техникийн хяналт",
      location: locByCode["LOC-006"]._id,
      locationName: "Серверийн өрөө",
      inspectedBy: emp["EMP-004"]._id,
      inspectedByName: "О.Энх-Од",
      approvedBy: emp["EMP-002"]._id,
      approvedByName: "О.Жанцанноров",
      inspectionDate: daysAgo(1, 22, 0),
      durationMinutes: 42,
      notes: "Ажиллагаа хэвийн",
      status: "Хийгдсэн",
    },
  ]);

  await Notification.insertMany([
    {
      title: "Зөвшөөрөлгүй нэвтрэлт илэрсэн",
      message: "Серверийн өрөөнд бүртгэлгүй нэвтрэлт илэрлээ.",
      type: "Яаралтай",
      status: "unread",
      user: userByName.manager._id,
      incident: incidents[2]._id,
      sentBy: userByName.staff._id,
      sentByName: "О.Гэрэлт-Од",
      sentAt: daysAgo(0, 8, 35),
    },
    {
      title: "Камер ажиллахгүй байна",
      message: "Үндсэн орцны камер ажиллахгүй байна.",
      type: "Анхааруулга",
      status: "unread",
      incident: incidents[1]._id,
      sentByName: "Систем автомат",
      sentAt: daysAgo(1, 22, 20),
    },
    {
      title: "Системийн шинэчлэл v3.2.0",
      message: "Backend + MongoDB хувилбар идэвхжлээ.",
      type: "Мэдээлэл",
      status: "read",
      sentByName: "Систем",
      sentAt: daysAgo(0, 9, 0),
      readAt: daysAgo(0, 9, 10),
    },
  ]);

  await Report.insertMany([
    {
      code: "REP-001",
      title: "6-р сарын 3-р долоо хоногийн тайлан",
      reportType: "weekly",
      createdBy: userByName.manager._id,
      createdByName: "О.Жанцанноров",
      periodStart: daysAgo(7),
      periodEnd: daysAgo(0),
      filePath: "/reports/june_w3_2026.xlsx",
      note: "Demo report",
      metrics: { incidents: { total: incidents.length } },
    },
  ]);

  await AuditLog.insertMany([
    {
      user: userByName.manager._id,
      username: "manager",
      userFullName: "О.Жанцанноров",
      actionType: "Мэдэгдэл илгээсэн",
      entityName: "notifications",
      entityId: "NOT-001",
      ipAddress: "192.168.1.102",
      createdAt: daysAgo(0, 8, 35),
      updatedAt: daysAgo(0, 8, 35),
    },
    {
      user: userByName.staff._id,
      username: "staff",
      userFullName: "О.Гэрэлт-Од",
      actionType: "Зөрчил бүртгэсэн",
      entityName: "incidents",
      entityId: "INC-041",
      ipAddress: "192.168.1.103",
      createdAt: daysAgo(0, 8, 32),
      updatedAt: daysAgo(0, 8, 32),
    },
    {
      username: "system",
      userFullName: "Систем",
      actionType: "Автомат илрүүлэлт",
      entityName: "notifications",
      entityId: "NOT-002",
      ipAddress: "127.0.0.1",
      createdAt: daysAgo(1, 22, 14),
      updatedAt: daysAgo(1, 22, 14),
    },
  ]);

  console.log("Seed амжилттай дууслаа.");
  console.log("Demo accounts:");
  console.log("  admin / admin123");
  console.log("  manager / manager123");
  console.log("  staff / staff123");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed алдаа:", error);
  process.exit(1);
});
