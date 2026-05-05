# ICN Security / Аюулгүй байдлын бүртгэлийн систем

Single-file `dadlaga web.html` төслийг Node.js + Express + MongoDB/Mongoose backend-тэй web app болгон салгасан хувилбар.

## File structure

```text
frontend/
  pages/
    login.html
    register.html
    dashboard.html
    settings.html
    incidents.html
    access-logs.html
    visitors.html
    inspections.html
    notifications.html
    reports.html
    rbac.html
    employees.html
    audit.html
  css/
    styles.css
    style.css
    auth.css
    dashboard.css
    table.css
    modal.css
    settings.css
  js/
    app.js
    auth.js
    api.js
    dashboard.js
    theme.js
    settings.js
    incidents.js
    visitors.js
    accessLogs.js
    inspections.js
    users.js
  assets/
backend/
  server.js
  config/
    db.js
  models/
    User.js
    Role.js
    Employee.js
    Department.js
    Location.js
    Incident.js
    AccessLog.js
    Visitor.js
    Inspection.js
    Notification.js
    Report.js
    AuditLog.js
    Attachment.js
    Permit.js
  routes/
    auth.routes.js
    users.routes.js
    employees.routes.js
    incidents.routes.js
    visitors.routes.js
    accessLogs.routes.js
    inspections.routes.js
    reports.routes.js
    notifications.routes.js
    audit.routes.js
    dashboard.routes.js
  controllers/
  middleware/
    auth.middleware.js
    role.middleware.js
  seed/
    seed.js
.env
package.json
README.md
```

## Ажиллуулах

1. MongoDB local server асаалттай байх хэрэгтэй.
2. Dependency суулгана:

```bash
npm install
npm install multer
```

3. Demo өгөгдөл MongoDB руу оруулна:

```bash
npm run seed
```

4. Development server асаана:

```bash
npm start
```

5. Browser дээр нээнэ:

```text
http://localhost:5000
http://localhost:5000/login.html
http://localhost:5000/register.html
http://localhost:5000/dashboard.html
```

## Demo accounts

```text
admin@icn.mn / admin123
manager@icn.mn / manager123
staff@icn.mn / staff123
```

## .env

```env
MONGO_URI=
JWT_SECRET=
PORT=5000
```

`MONGO_URI` хоосон байвал app `mongodb://127.0.0.1:27017/icn_security` default database ашиглана. Production дээр `JWT_SECRET`-ийг заавал хүчтэй утгаар солино.

## API endpoints

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

GET    /api/incidents
POST   /api/incidents
PUT    /api/incidents/:id
DELETE /api/incidents/:id

GET    /api/visitors
POST   /api/visitors
PUT    /api/visitors/:id
DELETE /api/visitors/:id

GET  /api/access-logs
POST /api/access-logs
PUT  /api/access-logs/:id
DELETE /api/access-logs/:id

GET    /api/inspections
POST   /api/inspections
PUT    /api/inspections/:id
DELETE /api/inspections/:id

GET  /api/employees
POST /api/employees

GET  /api/dashboard/stats
```

Frontend нь JWT token-ийг `localStorage` дотор хадгалж, бүх protected API request дээр `Authorization: Bearer <token>` header илгээдэг.
