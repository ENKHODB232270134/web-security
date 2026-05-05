(function initSecondaryPages() {
  const page = document.body.dataset.page;

  async function loadRbac() {
    const [usersResponse, options] = await Promise.all([API.get("/users"), ICN.loadOptions()]);
    const users = usersResponse.data || [];

    document.getElementById("rolesBody").innerHTML = options.roles
      .map((role) => {
        const count = users.filter((user) => user.role?.id === role.id).length;
        return `
          <tr>
            <td style="color:var(--accent2)">${ICN.escapeHtml(role.name)}</td>
            <td style="color:var(--text)">${ICN.escapeHtml(role.label)}</td>
            <td>${ICN.escapeHtml(role.description || "—")}</td>
            <td><span class="badge badge-blue">${count}</span></td>
          </tr>
        `;
      })
      .join("");

    document.getElementById("rbacGrid").innerHTML = users
      .map((user) => {
        const colorMap = {
          admin: "#f59e0b",
          security_manager: "#3b82f6",
          shift_supervisor: "#8b5cf6",
          security_staff: "#10b981",
          viewer: "#06b6d4",
        };
        const color = colorMap[user.role?.name] || "#64748b";
        return `
          <div class="user-card">
            <div class="user-avatar" style="background:${color}22;color:${color}">${ICN.escapeHtml((user.fullName || user.username)[0])}</div>
            <div class="user-info">
              <div class="user-name">${ICN.escapeHtml(user.fullName)}</div>
              <div class="user-dept">${ICN.escapeHtml(user.role?.label || "viewer")}</div>
              <div class="user-meta">
                <span class="badge badge-blue">@${ICN.escapeHtml(user.username)}</span>
                ${ICN.badge(user.status)}
                ${user.expiresAt ? `<span class="badge badge-gray">${ICN.formatDateOnly(user.expiresAt)}</span>` : ""}
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  async function setupUserModal() {
    const options = await ICN.loadOptions();
    ICN.fillSelect("userRole", options.roles, "label", "id");
    ICN.fillSelect("userEmployee", options.employees, "fullName", "id", "— Холбохгүй —");
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    document.getElementById("userExpires").value = expiresAt.toISOString().slice(0, 10);
  }

  async function submitUser(event) {
    event.preventDefault();
    try {
      await API.post("/users", {
        fullName: document.getElementById("userFullName").value,
        username: document.getElementById("userUsername").value,
        password: document.getElementById("userPassword").value,
        roleId: document.getElementById("userRole").value,
        employeeId: document.getElementById("userEmployee").value,
        status: document.getElementById("userStatus").value,
        expiresAt: document.getElementById("userExpires").value,
      });
      ICN.closeModal("userModal");
      await loadRbac();
      ICN.showToast("Хэрэглэгч бүртгэгдлээ", "success");
    } catch (error) {
      ICN.showToast(error.message, "error");
    }
  }

  async function loadEmployees() {
    const [employeesResponse, options] = await Promise.all([API.get("/employees"), ICN.loadOptions()]);
    const employees = employeesResponse.data || [];

    document.getElementById("employeesBody").innerHTML = employees
      .map(
        (employee) => `
          <tr>
            <td style="color:var(--accent2)">${ICN.escapeHtml(employee.employeeCode)}</td>
            <td style="color:var(--text)">${ICN.escapeHtml(employee.firstName)}</td>
            <td>${ICN.escapeHtml(employee.lastName || "")}</td>
            <td><span class="badge badge-purple">${ICN.escapeHtml(employee.position)}</span></td>
            <td>${ICN.escapeHtml(employee.department?.name || "—")}</td>
            <td>${ICN.escapeHtml(employee.phone || "—")}</td>
            <td>${ICN.escapeHtml(employee.email || "—")}</td>
            <td>${ICN.formatDateOnly(employee.hireDate)}</td>
          </tr>
        `
      )
      .join("");
    document.getElementById("employeesCount").textContent = `${employees.length} бүртгэл`;

    document.getElementById("departmentCards").innerHTML = options.departments
      .map((department) => {
        const count = employees.filter((employee) => employee.department?.id === department.id).length;
        return `
          <div class="dept-card">
            <div class="dept-name">${ICN.escapeHtml(department.name)}</div>
            <div class="dept-desc">${ICN.escapeHtml(department.description || "—")}</div>
            <span class="badge badge-blue">${ICN.escapeHtml(department.code)}</span>
            <span class="badge badge-green">${count} ажилтан</span>
          </div>
        `;
      })
      .join("");

    document.getElementById("locationsBody").innerHTML = options.locations
      .map(
        (location) => `
          <tr>
            <td style="color:var(--accent2)">${ICN.escapeHtml(location.code)}</td>
            <td style="color:var(--text)">${ICN.escapeHtml(location.name)}</td>
            <td><span class="badge badge-purple">${ICN.escapeHtml(location.type)}</span></td>
            <td>${ICN.escapeHtml(location.address || "—")}</td>
            <td>${ICN.escapeHtml(location.description || "—")}</td>
          </tr>
        `
      )
      .join("");
    document.getElementById("locationsCount").textContent = `${options.locations.length} байршил`;
  }

  async function setupEmployeeModal() {
    const options = await ICN.loadOptions();
    ICN.fillSelect("employeeDepartment", options.departments, "name", "id");
    document.getElementById("employeeHireDate").value = new Date().toISOString().slice(0, 10);
  }

  async function submitEmployee(event) {
    event.preventDefault();
    try {
      await API.post("/employees", {
        firstName: document.getElementById("employeeFirstName").value,
        lastName: document.getElementById("employeeLastName").value,
        position: document.getElementById("employeePosition").value,
        departmentId: document.getElementById("employeeDepartment").value,
        phone: document.getElementById("employeePhone").value,
        email: document.getElementById("employeeEmail").value,
        hireDate: document.getElementById("employeeHireDate").value,
      });
      ICN.closeModal("employeeModal");
      await loadEmployees();
      ICN.showToast("Ажилтан бүртгэгдлээ", "success");
    } catch (error) {
      ICN.showToast(error.message, "error");
    }
  }

  function switchEmpTab(tabId, button) {
    ["employeesList", "departmentsList", "locationsList"].forEach((id) => {
      document.getElementById(id).style.display = id === tabId ? "" : "none";
    });
    button.closest(".nav-tabs").querySelectorAll(".nav-tab").forEach((tab) => tab.classList.remove("active"));
    button.classList.add("active");
  }

  async function loadNotifications() {
    const response = await API.get("/notifications");
    const notifications = response.data || [];
    document.getElementById("notificationsList").innerHTML = notifications
      .map(
        (item) => `
          <div class="notif-card ${item.read ? "" : "unread"}" onclick="markNotificationRead('${item.id}')">
            <div class="notif-icon-wrap"><span>${item.type === "Яаралтай" ? "!" : "i"}</span></div>
            <div class="notif-content">
              <div class="notif-title">${ICN.escapeHtml(item.title)}</div>
              <div class="notif-msg">${ICN.escapeHtml(item.message)}</div>
              <div class="notif-time">${ICN.formatDate(item.sentAt)} • ${ICN.escapeHtml(item.sentByName || "Систем")} ${item.incidentCode ? "• " + ICN.escapeHtml(item.incidentCode) : ""}</div>
            </div>
            ${ICN.badge(item.status)}
          </div>
        `
      )
      .join("");
  }

  async function setupNotificationModal() {
    const options = await ICN.loadOptions();
    ICN.fillSelect("notificationUser", options.users, "fullName", "id", "— Бүх хэрэглэгч —");
  }

  async function submitNotification(event) {
    event.preventDefault();
    try {
      await API.post("/notifications", {
        title: document.getElementById("notificationTitle").value,
        type: document.getElementById("notificationType").value,
        userId: document.getElementById("notificationUser").value,
        message: document.getElementById("notificationMessage").value,
      });
      ICN.closeModal("notificationModal");
      await loadNotifications();
      ICN.showToast("Мэдэгдэл илгээгдлээ", "success");
    } catch (error) {
      ICN.showToast(error.message, "error");
    }
  }

  async function markNotificationRead(id) {
    await API.put(`/notifications/${id}/read`, {});
    await loadNotifications();
  }

  async function loadReports() {
    const response = await API.get("/reports");
    const metrics = response.metrics || {};
    const incidents = metrics.incidents || {};
    const visitors = metrics.visitors || {};
    const inspections = metrics.inspections || {};
    const notifications = metrics.notifications || {};

    document.getElementById("reportBody").innerHTML = `
      <tr><td style="color:var(--text)">incidents</td><td>${incidents.total || 0}</td><td>${incidents.solved || 0}</td><td>${incidents.pending || 0}</td></tr>
      <tr><td style="color:var(--text)">access_logs</td><td>${metrics.accessLogs?.total || 0}</td><td>${metrics.accessLogs?.total || 0}</td><td>0</td></tr>
      <tr><td style="color:var(--text)">visitors</td><td>${visitors.total || 0}</td><td>${visitors.left || 0}</td><td>${visitors.inside || 0}</td></tr>
      <tr><td style="color:var(--text)">inspections</td><td>${inspections.total || 0}</td><td>${inspections.completed || 0}</td><td>${(inspections.total || 0) - (inspections.completed || 0)}</td></tr>
      <tr><td style="color:var(--text)">notifications</td><td>${notifications.total || 0}</td><td>${(notifications.total || 0) - (notifications.unread || 0)}</td><td>${notifications.unread || 0}</td></tr>
    `;

    document.getElementById("reportsList").innerHTML = (response.data || [])
      .map(
        (report) => `
          <tr>
            <td style="color:var(--accent2)">${ICN.escapeHtml(report.code)}</td>
            <td style="color:var(--text)">${ICN.escapeHtml(report.title)}</td>
            <td>${ICN.escapeHtml(report.reportType)}</td>
            <td>${ICN.escapeHtml(report.createdByName || "—")}</td>
            <td>${ICN.formatDate(report.createdAt)}</td>
            <td>${ICN.escapeHtml(report.filePath || "—")}</td>
          </tr>
        `
      )
      .join("");
  }

  async function exportReport() {
    try {
      await API.post("/reports", { title: "Гараар экспортолсон ICN Security тайлан" });
      await loadReports();
      ICN.showToast("Тайлан reports collection-д хадгалагдлаа", "success");
    } catch (error) {
      ICN.showToast(error.message, "error");
    }
  }

  async function loadAudit() {
    const response = await API.get("/audit");
    const stats = response.stats || {};
    document.getElementById("auditTotal").textContent = stats.total || 0;
    document.getElementById("auditToday").textContent = stats.today || 0;
    document.getElementById("auditUsers").textContent = stats.users || 0;
    document.getElementById("auditBody").innerHTML = (response.data || [])
      .map(
        (log) => `
          <tr>
            <td>${ICN.formatDate(log.createdAt)}</td>
            <td style="color:var(--text)">${ICN.escapeHtml(log.userFullName || log.username)}</td>
            <td>${ICN.escapeHtml(log.actionType)}</td>
            <td><span class="badge badge-blue">${ICN.escapeHtml(log.entityName)}</span></td>
            <td style="color:var(--accent2)">${ICN.escapeHtml(log.entityId || "—")}</td>
            <td>${ICN.escapeHtml(log.ipAddress || "—")}</td>
          </tr>
        `
      )
      .join("");
  }

  window.onModalOpen = (id) => {
    if (id === "userModal") setupUserModal();
    if (id === "employeeModal") setupEmployeeModal();
    if (id === "notificationModal") setupNotificationModal();
  };

  window.onPageReady = () => {
    if (page === "rbac") loadRbac();
    if (page === "employees") loadEmployees();
    if (page === "notifications") loadNotifications();
    if (page === "reports") loadReports();
    if (page === "audit") loadAudit();
  };

  window.submitUser = submitUser;
  window.submitEmployee = submitEmployee;
  window.switchEmpTab = switchEmpTab;
  window.submitNotification = submitNotification;
  window.markNotificationRead = markNotificationRead;
  window.exportReport = exportReport;
})();
