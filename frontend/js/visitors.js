(function initVisitorsPage() {
  let visitors = [];

  async function loadVisitors() {
    const response = await API.get("/visitors");
    visitors = response.data || [];
    renderVisitors();
  }

  function renderVisitors() {
    document.getElementById("visitorsBody").innerHTML = visitors
      .map(
        (item) => `
          <tr>
            <td style="color:var(--accent2)">${ICN.escapeHtml(item.code)}</td>
            <td>${ICN.formatDate(item.date)}</td>
            <td style="color:var(--text)">${ICN.escapeHtml(item.firstName)}</td>
            <td>${ICN.escapeHtml(item.lastName)}</td>
            <td>${ICN.escapeHtml(item.organisationName || "—")}</td>
            <td>${ICN.escapeHtml(item.purpose || "—")}</td>
            <td><span class="badge badge-gray">${ICN.escapeHtml(item.schedule || "—")}</span></td>
            <td>${ICN.escapeHtml(item.responsibleName || "—")}</td>
            <td>${ICN.badge(item.status)}</td>
            <td>
              <button class="tbl-action" onclick="visitorLeave('${item.id}')">Гарсан</button>
              <button class="tbl-action" onclick="editVisitor('${item.id}')">Засах</button>
              <button class="tbl-action danger" onclick="deleteVisitor('${item.id}')">Устгах</button>
            </td>
          </tr>
        `
      )
      .join("");
    document.getElementById("visitorsCount").textContent = `Нийт ${visitors.length} бүртгэл`;
  }

  async function setupVisitorModal(item = null) {
    const options = await ICN.loadOptions();
    ICN.fillSelect("visitorResponsible", options.employees, "fullName", "id");
    document.getElementById("visitorId").value = item?.id || "";
    document.getElementById("visitorFirstName").value = item?.firstName || "";
    document.getElementById("visitorLastName").value = item?.lastName || "";
    document.getElementById("visitorOrg").value = item?.organisationName || "";
    document.getElementById("visitorRegister").value = item?.registerNo || "";
    document.getElementById("visitorPurpose").value = item?.purpose || "";
    document.getElementById("visitorStatus").value = item?.status || "Байгаа";
  }

  async function submitVisitor(event) {
    event.preventDefault();
    const id = document.getElementById("visitorId").value;
    const payload = {
      firstName: document.getElementById("visitorFirstName").value,
      lastName: document.getElementById("visitorLastName").value,
      organisationName: document.getElementById("visitorOrg").value,
      registerNo: document.getElementById("visitorRegister").value,
      purpose: document.getElementById("visitorPurpose").value,
      responsibleEmployee: document.getElementById("visitorResponsible").value,
      status: document.getElementById("visitorStatus").value,
    };

    try {
      if (id) await API.put(`/visitors/${id}`, payload);
      else await API.post("/visitors", payload);
      ICN.closeModal("visitorModal");
      await loadVisitors();
      ICN.showToast("visitors өгөгдөл хадгалагдлаа", "success");
    } catch (error) {
      ICN.showToast(error.message, "error");
    }
  }

  async function editVisitor(id) {
    const item = visitors.find((row) => row.id === id);
    await setupVisitorModal(item);
    ICN.openModal("visitorModal");
  }

  async function visitorLeave(id) {
    await API.put(`/visitors/${id}`, { status: "Гарсан" });
    await loadVisitors();
  }

  async function deleteVisitor(id) {
    if (!confirm("Энэ зочны бүртгэлийг устгах уу?")) return;
    try {
      await API.delete(`/visitors/${id}`);
      await loadVisitors();
      ICN.showToast("Зочин устгагдлаа", "success");
    } catch (error) {
      ICN.showToast(error.message, "error");
    }
  }

  window.onModalOpen = (id) => {
    if (id === "visitorModal" && !document.getElementById("visitorId").value) setupVisitorModal();
  };
  window.onPageReady = loadVisitors;
  window.submitVisitor = submitVisitor;
  window.editVisitor = editVisitor;
  window.visitorLeave = visitorLeave;
  window.deleteVisitor = deleteVisitor;
})();
