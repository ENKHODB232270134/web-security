(function initDashboard() {
  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function moduleCard(route, badge, iconColor, bg, title, desc, svg) {
    return `
      <div class="mod-card" onclick="goTo('${route}')">
        <span class="mod-badge badge badge-blue">${badge}</span>
        <div class="mod-icon" style="background:${bg}">${svg.replace("<svg", `<svg style="stroke:${iconColor}"`)}</div>
        <div class="mod-name">${title}</div>
        <div class="mod-desc">${desc}</div>
      </div>
    `;
  }

  async function loadDashboard(user) {
    const { data } = await API.get("/dashboard/stats");
    setText("dashGreeting", `Сайн байна уу, ${user.fullName || user.username}!`);
    setText("kpiIncidents", data.incidents);
    setText("kpiEntries", data.accessLogs);
    setText("kpiVisitors", data.visitors);
    setText("kpiPending", data.pendingIncidents);
    setText("kpiEmployees", data.employees);
    setText("kpiDepts", data.departments);
    setText("kpiLocations", data.locations);
    setText("kpiInspections", data.inspections);

    document.getElementById("recentIncidents").innerHTML = data.recentIncidents
      .map(
        (item) => `
          <tr>
            <td style="color:var(--accent2)">${ICN.escapeHtml(item.code)}</td>
            <td style="color:var(--text)">${ICN.escapeHtml(item.incidentType)}</td>
            <td>${ICN.escapeHtml(item.locationName || "—")}</td>
            <td>${ICN.badge(item.severity)}</td>
            <td>${ICN.badge(item.status)}</td>
          </tr>
        `
      )
      .join("");

    document.getElementById("recentAccess").innerHTML = data.recentAccessLogs
      .map(
        (item) => `
          <tr>
            <td style="color:var(--accent2)">${ICN.escapeHtml(item.code)}</td>
            <td style="color:var(--text)">${ICN.escapeHtml(item.personName)}</td>
            <td>${ICN.escapeHtml(item.locationName || "—")}</td>
            <td>${ICN.badge(item.accessType)}</td>
          </tr>
        `
      )
      .join("");
  }

  window.onPageReady = loadDashboard;
})();
