(function initIncidentsPage() {
  let incidents = [];

  async function loadIncidents() {
    const response = await API.get("/incidents");
    incidents = response.data || [];
    renderIncidents();
  }

  function renderIncidents() {
    const body = document.getElementById("incidentsBody");
    body.innerHTML = incidents
      .map(
        (item) => `
          <tr>
            <td style="color:var(--accent2)">${ICN.escapeHtml(item.code)}</td>
            <td>${ICN.formatDate(item.date)}</td>
            <td style="color:var(--text)">${ICN.escapeHtml(item.incidentType)}</td>
            <td>${ICN.escapeHtml(item.locationName || "—")}</td>
            <td>${ICN.badge(item.severity)}</td>
            <td>${ICN.badge(item.status)}</td>
            <td>${ICN.escapeHtml(item.reportedByName || "—")}</td>
            <td>${ICN.escapeHtml(item.assignedToName || "—")}</td>
            <td>
              <button class="tbl-action" onclick="cycleIncidentStatus('${item.id}')">Төлөв</button>
              <button class="tbl-action" onclick="editIncident('${item.id}')">Засах</button>
              <button class="tbl-action danger" onclick="deleteIncident('${item.id}')">Устгах</button>
            </td>
          </tr>
        `
      )
      .join("");

    document.getElementById("incidentsCount").textContent = `Нийт ${incidents.length} бүртгэл`;
  }

  async function setupIncidentModal(item = null) {
    const options = await ICN.loadOptions();
    ICN.fillSelect("incidentLocation", options.locations, "name", "id");
    ICN.fillSelect("incidentAssigned", options.employees, "fullName", "id", "— Сонгоогүй —");

    document.getElementById("incidentId").value = item?.id || "";
    document.getElementById("incidentType").value = item?.incidentType || "Хаалга нээлттэй үлдсэн";
    document.getElementById("incidentSeverity").value = item?.severity || "Дунд";
    document.getElementById("incidentStatus").value = item?.status || "Хүлээгдэж буй";
    document.getElementById("incidentDescription").value = item?.description || "";
    document.getElementById("incidentDate").value = item?.date ? new Date(item.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
  }

  async function submitIncident(event) {
    event.preventDefault();
    const id = document.getElementById("incidentId").value;
    const payload = {
      incidentType: document.getElementById("incidentType").value,
      severity: document.getElementById("incidentSeverity").value,
      status: document.getElementById("incidentStatus").value,
      locationId: document.getElementById("incidentLocation").value,
      assignedTo: document.getElementById("incidentAssigned").value,
      description: document.getElementById("incidentDescription").value,
      occurredAt: document.getElementById("incidentDate").value,
    };

    try {
      if (id) await API.put(`/incidents/${id}`, payload);
      else await API.post("/incidents", payload);
      ICN.closeModal("incidentModal");
      await loadIncidents();
      ICN.showToast("incidents өгөгдөл хадгалагдлаа", "success");
    } catch (error) {
      ICN.showToast(error.message, "error");
    }
  }

  async function editIncident(id) {
    const item = incidents.find((row) => row.id === id);
    await setupIncidentModal(item);
    ICN.openModal("incidentModal");
  }

  async function cycleIncidentStatus(id) {
    const item = incidents.find((row) => row.id === id);
    if (!item) return;
    const cycle = ["Хүлээгдэж буй", "Шийдвэрлэж байна", "Шийдвэрлэсэн", "Хаагдсан"];
    const next = cycle[(cycle.indexOf(item.status) + 1) % cycle.length];
    await API.put(`/incidents/${id}`, { status: next });
    await loadIncidents();
  }

  async function deleteIncident(id) {
    if (!confirm("Энэ зөрчлийн бүртгэлийг устгах уу?")) return;
    try {
      await API.delete(`/incidents/${id}`);
      await loadIncidents();
      ICN.showToast("Зөрчил устгагдлаа", "success");
    } catch (error) {
      ICN.showToast(error.message, "error");
    }
  }

  window.onModalOpen = (id) => {
    if (id === "incidentModal" && !document.getElementById("incidentId").value) setupIncidentModal();
  };
  window.onPageReady = loadIncidents;
  window.submitIncident = submitIncident;
  window.editIncident = editIncident;
  window.cycleIncidentStatus = cycleIncidentStatus;
  window.deleteIncident = deleteIncident;
})();
