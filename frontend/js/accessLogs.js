(function initAccessLogsPage() {
  async function loadAccessLogs() {
    const response = await API.get("/access-logs");
    const logs = response.data || [];
    document.getElementById("accessLogsBody").innerHTML = logs
      .map(
        (item) => `
          <tr>
            <td style="color:var(--accent2)">${ICN.escapeHtml(item.code)}</td>
            <td>${ICN.formatDate(item.date)}</td>
            <td style="color:var(--text)">${ICN.escapeHtml(item.personName)}</td>
            <td>${ICN.badge(item.personType)}</td>
            <td>${ICN.escapeHtml(item.locationName || "—")}</td>
            <td>${ICN.badge(item.accessType)}</td>
            <td>${ICN.escapeHtml(item.approvedByName || "—")}</td>
            <td>${ICN.escapeHtml(item.note || "—")}</td>
          </tr>
        `
      )
      .join("");
    document.getElementById("accessLogsCount").textContent = `Нийт ${logs.length} бүртгэл`;
  }

  async function setupAccessModal() {
    const options = await ICN.loadOptions();
    ICN.fillSelect("accessLocation", options.locations, "name", "id");
    ICN.fillSelect("accessApproved", options.employees, "fullName", "id", "— Сонгоогүй —");
  }

  async function submitAccessLog(event) {
    event.preventDefault();
    const payload = {
      personType: document.getElementById("accessPersonType").value,
      accessType: document.getElementById("accessType").value,
      personName: document.getElementById("accessPersonName").value,
      position: document.getElementById("accessPosition").value,
      locationId: document.getElementById("accessLocation").value,
      approvedBy: document.getElementById("accessApproved").value,
      note: document.getElementById("accessNote").value,
    };

    try {
      await API.post("/access-logs", payload);
      ICN.closeModal("accessModal");
      await loadAccessLogs();
      ICN.showToast("access_logs хадгалагдлаа", "success");
    } catch (error) {
      ICN.showToast(error.message, "error");
    }
  }

  window.onModalOpen = (id) => {
    if (id === "accessModal") setupAccessModal();
  };
  window.onPageReady = loadAccessLogs;
  window.submitAccessLog = submitAccessLog;
})();
