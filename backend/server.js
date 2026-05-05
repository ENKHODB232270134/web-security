const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");
const employeesRoutes = require("./routes/employees.routes");
const incidentsRoutes = require("./routes/incidents.routes");
const visitorsRoutes = require("./routes/visitors.routes");
const accessLogsRoutes = require("./routes/accessLogs.routes");
const inspectionsRoutes = require("./routes/inspections.routes");
const reportsRoutes = require("./routes/reports.routes");
const notificationsRoutes = require("./routes/notifications.routes");
const auditRoutes = require("./routes/audit.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "ICN Security API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/employees", employeesRoutes);
app.use("/api/incidents", incidentsRoutes);
app.use("/api/visitors", visitorsRoutes);
app.use("/api/access-logs", accessLogsRoutes);
app.use("/api/access_logs", accessLogsRoutes);
app.use("/api/inspections", inspectionsRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/dashboard", dashboardRoutes);

const frontendDir = path.join(__dirname, "..", "frontend");
const uploadsDir = path.join(__dirname, "uploads");
app.use(express.static(frontendDir));
app.use("/uploads", express.static(uploadsDir));

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendDir, "pages", "login.html"));
});

app.get("/login.html", (req, res) => {
  res.sendFile(path.join(frontendDir, "pages", "login.html"));
});

app.get("/register.html", (req, res) => {
  res.sendFile(path.join(frontendDir, "pages", "register.html"));
});

app.get("/dashboard.html", (req, res) => {
  res.sendFile(path.join(frontendDir, "pages", "dashboard.html"));
});

app.get("/settings.html", (req, res) => {
  res.sendFile(path.join(frontendDir, "pages", "settings.html"));
});

app.use((req, res) => {
  res.status(404).json({ message: "API эсвэл page олдсонгүй" });
});

app.use((err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || "Серверийн алдаа гарлаа",
  });
});

app.listen(PORT, () => {
  console.log(`ICN Security app ажиллаж байна: http://localhost:${PORT}`);
});
