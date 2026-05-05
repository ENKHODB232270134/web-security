(function initCommonApp() {
  const pageMap = {
    login: "/pages/login.html",
    dashboard: "/pages/dashboard.html",
    incidents: "/pages/incidents.html",
    access: "/pages/access-logs.html",
    visitors: "/pages/visitors.html",
    inspections: "/pages/inspections.html",
    notifications: "/pages/notifications.html",
    reports: "/pages/reports.html",
    rbac: "/pages/rbac.html",
    employees: "/pages/employees.html",
    audit: "/pages/audit.html",
  };

  const roleColors = {
    admin: "#f59e0b",
    security_manager: "#3b82f6",
    shift_supervisor: "#8b5cf6",
    security_staff: "#10b981",
    viewer: "#06b6d4",
  };

  function goTo(name) {
    location.href = pageMap[name] || pageMap.dashboard;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return escapeHtml(value);
    return date.toLocaleString("mn-MN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDateOnly(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return escapeHtml(value);
    return date.toLocaleDateString("mn-MN");
  }

  function badge(value) {
    const text = escapeHtml(value || "—");
    const map = {
      "Нэн яаралтай": "badge-red",
      "Өндөр": "badge-red",
      "Дунд": "badge-orange",
      "Бага": "badge-blue",
      "Хүлээгдэж буй": "badge-orange",
      "Шийдвэрлэж байна": "badge-blue",
      "Шийдвэрлэсэн": "badge-green",
      "Хаагдсан": "badge-gray",
      "Нэвтэрсэн": "badge-green",
      "Гарсан": "badge-gray",
      "Байгаа": "badge-green",
      "Хийгдсэн": "badge-green",
      "Хоцорсон": "badge-red",
      active: "badge-green",
      disabled: "badge-red",
      unread: "badge-red",
      read: "badge-green",
      "Яаралтай": "badge-red",
      "Анхааруулга": "badge-orange",
      "Мэдээлэл": "badge-blue",
    };

    return `<span class="badge ${map[value] || "badge-gray"}">${text}</span>`;
  }

  function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity .25s";
      setTimeout(() => toast.remove(), 260);
    }, 3600);
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove("hidden");
    if (typeof window.onModalOpen === "function") window.onModalOpen(id);
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add("hidden");
  }

  function filterTable(tableId, query) {
    const rows = document.querySelectorAll(`#${tableId} tbody tr`);
    const normalized = String(query || "").toLowerCase();
    rows.forEach((row) => {
      row.style.display = row.textContent.toLowerCase().includes(normalized) ? "" : "none";
    });
  }

  function filterByStatus(tableId, status, button) {
    button?.closest(".table-toolbar")?.querySelectorAll(".filter-chip").forEach((item) => item.classList.remove("on"));
    button?.classList.add("on");
    const rows = document.querySelectorAll(`#${tableId} tbody tr`);
    rows.forEach((row) => {
      row.style.display = !status || row.textContent.includes(status) ? "" : "none";
    });
  }

  async function loadOptions() {
    if (window.ICN.options) return window.ICN.options;
    const options = await API.get("/users/options");
    window.ICN.options = options;
    return options;
  }

  function fillSelect(selectId, items, labelKey = "name", valueKey = "id", placeholder = "— Сонгох —") {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = `<option value="">${placeholder}</option>${items
      .map((item) => `<option value="${escapeHtml(item[valueKey])}">${escapeHtml(item[labelKey])}</option>`)
      .join("")}`;
  }

  function applyUserBadge(user) {
    const color = roleColors[user?.role?.name] || "#64748b";
    document.querySelectorAll("[data-user-name]").forEach((el) => {
      el.textContent = user?.fullName || user?.username || "Хэрэглэгч";
    });
    document.querySelectorAll("[data-user-role]").forEach((el) => {
      el.textContent = user?.role?.label || "viewer";
    });
    document.querySelectorAll("[data-user-dot]").forEach((el) => {
      el.style.background = color;
      el.style.boxShadow = `0 0 12px ${color}66`;
    });
  }

  async function requireAuth() {
    const token = API.getToken();
    if (!token) {
      location.href = "/pages/login.html";
      return null;
    }

    try {
      const { user } = await API.get("/auth/me");
      localStorage.setItem("icn_user", JSON.stringify(user));
      applyUserBadge(user);
      return user;
    } catch (error) {
      showToast(error.message, "error");
      return null;
    }
  }

  function logout() {
    API.clearSession();
    location.href = "/pages/login.html";
  }

  function tickClock() {
    const value = new Date().toLocaleDateString("mn-MN") + "  " + new Date().toLocaleTimeString("mn-MN");
    document.querySelectorAll("[data-clock]").forEach((el) => {
      el.textContent = value;
    });
    const loginClock = document.getElementById("clockInLogin");
    if (loginClock) loginClock.textContent = `Систем идэвхтэй — ${value}`;
  }

  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("overlay")) event.target.classList.add("hidden");
  });

  document.addEventListener("DOMContentLoaded", async () => {
    tickClock();
    setInterval(tickClock, 1000);

    if (document.body.dataset.protected === "true") {
      const user = await requireAuth();
      if (user && typeof window.onPageReady === "function") window.onPageReady(user);
    } else if (typeof window.onPageReady === "function") {
      window.onPageReady(API.getStoredUser());
    }
  });

  window.ICN = {
    goTo,
    logout,
    escapeHtml,
    formatDate,
    formatDateOnly,
    badge,
    showToast,
    openModal,
    closeModal,
    filterTable,
    filterByStatus,
    loadOptions,
    fillSelect,
    requireAuth,
    options: null,
  };

  window.goTo = goTo;
  window.doLogout = logout;
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.filterTable = filterTable;
  window.filterByStatus = filterByStatus;
})();
