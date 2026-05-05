(function initInspectionsPage() {
  async function loadInspections() {
    const response = await API.get("/inspections");
    const inspections = response.data || [];
    document.getElementById("inspectionsBody").innerHTML = inspections
      .map(
        (item) => `
          <tr>
            <td style="color:var(--accent2)">${ICN.escapeHtml(item.code)}</td>
            <td>${ICN.formatDate(item.date)}</td>
            <td style="color:var(--text)">${ICN.escapeHtml(item.inspectedByName || "—")}</td>
            <td>${ICN.escapeHtml(item.locationName || "—")}</td>
            <td><span class="badge badge-purple">${ICN.escapeHtml(item.inspectionType)}</span></td>
            <td>${item.durationMinutes || 0} мин</td>
            <td>${ICN.escapeHtml(item.notes || "—")}</td>
            <td>${ICN.badge(item.status)}</td>
          </tr>
        `
      )
      .join("");
    document.getElementById("inspectionsCount").textContent = `Нийт ${inspections.length} бүртгэл`;
  }

  async function setupInspectionModal() {
    const options = await ICN.loadOptions();
    ICN.fillSelect("inspectionEmployee", options.employees, "fullName", "id");
    ICN.fillSelect("inspectionApproved", options.employees, "fullName", "id", "— Сонгоогүй —");
    ICN.fillSelect("inspectionLocation", options.locations, "name", "id");
  }

  async function submitInspection(event) {
    event.preventDefault();
    const payload = {
      inspectedBy: document.getElementById("inspectionEmployee").value,
      approvedBy: document.getElementById("inspectionApproved").value,
      locationId: document.getElementById("inspectionLocation").value,
      inspectionType: document.getElementById("inspectionType").value,
      durationMinutes: document.getElementById("inspectionDuration").value,
      notes: document.getElementById("inspectionNotes").value,
    };

    try {
      await API.post("/inspections", payload);
      ICN.closeModal("inspectionModal");
      await loadInspections();
      ICN.showToast("inspections хадгалагдлаа", "success");
    } catch (error) {
      ICN.showToast(error.message, "error");
    }
  }

  window.onModalOpen = (id) => {
    if (id === "inspectionModal") setupInspectionModal();
  };
  window.onPageReady = loadInspections;
  window.submitInspection = submitInspection;
})();
