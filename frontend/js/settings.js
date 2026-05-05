(function initSettingsPage() {
  let currentUser = null;
  let selectedTheme = "dark";
  let selectedAccent = "blue";

  function setValue(id, value) {
    const element = document.getElementById(id);
    if (element) element.value = value || "";
  }

  function setChecked(id, value) {
    const element = document.getElementById(id);
    if (element) element.checked = Boolean(value);
  }

  function updateAvatar(user, previewUrl) {
    const avatar = document.getElementById("settingsAvatar");
    const avatarUrl = previewUrl || user?.avatarUrl;
    if (!avatar) return;

    if (avatarUrl) {
      avatar.innerHTML = `<img src="${ICN.escapeHtml(avatarUrl)}" alt="Profile avatar" />`;
    } else {
      const initial = (user?.fullName || user?.name || user?.username || "U").trim()[0] || "U";
      avatar.textContent = initial.toUpperCase();
    }
  }

  function markSelection(group, value) {
    document.querySelectorAll(`[data-${group}]`).forEach((card) => {
      card.classList.toggle("active", card.dataset[group] === value);
    });
  }

  function syncUserSummary(user) {
    document.getElementById("profileSummaryName").textContent = user.fullName || user.name || user.username || "Хэрэглэгч";
    document.getElementById("profileSummaryRole").textContent = user.roleDisplayName || user.role?.label || "viewer";
    document.getElementById("profileSummaryEmail").textContent = user.email || "";
    updateAvatar(user);
  }

  function fillForm(user) {
    currentUser = user;
    setValue("fullName", user.fullName || user.name);
    setValue("email", user.email);
    setValue("phone", user.phone);
    setValue("jobTitle", user.jobTitle);
    setValue("department", user.department);
    setValue("roleDisplayName", user.roleDisplayName || user.role?.label);
    setValue("bio", user.bio);

    selectedTheme = user.themePreference || ThemeManager.getPreference();
    selectedAccent = user.accentColor || ThemeManager.getAccent();
    markSelection("theme", selectedTheme);
    markSelection("accent", selectedAccent);
    ThemeManager.applyTheme(selectedTheme, selectedAccent);

    const settings = user.notificationSettings || {};
    setChecked("emailNotifications", settings.emailNotifications ?? true);
    setChecked("dashboardAlerts", settings.dashboardAlerts ?? true);
    setChecked("incidentUpdates", settings.incidentUpdates ?? true);
    setChecked("visitorAlerts", settings.visitorAlerts ?? true);
    syncUserSummary(user);
  }

  async function loadSettings() {
    try {
      const response = await API.get("/users/me");
      localStorage.setItem("icn_user", JSON.stringify(response.user));
      fillForm(response.user);
    } catch (error) {
      ICN.showToast(error.message, "error");
    }
  }

  async function saveProfile(event) {
    event.preventDefault();
    const button = document.getElementById("saveProfileBtn");
    button.disabled = true;
    button.textContent = "Хадгалж байна...";

    try {
      const response = await API.put("/users/me", {
        fullName: document.getElementById("fullName").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        jobTitle: document.getElementById("jobTitle").value.trim(),
        department: document.getElementById("department").value.trim(),
        roleDisplayName: document.getElementById("roleDisplayName").value.trim(),
        bio: document.getElementById("bio").value.trim(),
      });
      localStorage.setItem("icn_user", JSON.stringify(response.user));
      fillForm(response.user);
      ICN.showToast("Профайл амжилттай хадгалагдлаа", "success");
    } catch (error) {
      ICN.showToast(error.message, "error");
    } finally {
      button.disabled = false;
      button.textContent = "Хадгалах";
    }
  }

  async function uploadAvatar(event) {
    event.preventDefault();
    const input = document.getElementById("avatarInput");
    const file = input.files?.[0];
    if (!file) {
      ICN.showToast("Эхлээд зураг сонгоно уу", "error");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await fetch("/api/users/me/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API.getToken()}`,
        },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Зураг хадгалахад алдаа гарлаа");

      currentUser = data.user;
      localStorage.setItem("icn_user", JSON.stringify(data.user));
      fillForm(data.user);
      ICN.showToast("Профайл зураг шинэчлэгдлээ", "success");
    } catch (error) {
      ICN.showToast(error.message, "error");
    }
  }

  async function changePassword(event) {
    event.preventDefault();
    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
      ICN.showToast("Шинэ нууц үг давталттайгаа таарахгүй байна", "error");
      return;
    }

    try {
      const response = await API.put("/users/me/password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      document.getElementById("passwordForm").reset();
      ICN.showToast(response.message || "Нууц үг шинэчлэгдлээ", "success");
    } catch (error) {
      ICN.showToast(error.message, "error");
    }
  }

  async function saveAppearance() {
    ThemeManager.applyTheme(selectedTheme, selectedAccent);
    try {
      const response = await API.put("/users/me", {
        themePreference: selectedTheme,
        accentColor: selectedAccent,
      });
      localStorage.setItem("icn_user", JSON.stringify(response.user));
      ICN.showToast("Theme тохиргоо хадгалагдлаа", "success");
    } catch (error) {
      ICN.showToast(error.message, "error");
    }
  }

  async function saveNotifications() {
    try {
      const response = await API.put("/users/me", {
        notificationSettings: {
          emailNotifications: document.getElementById("emailNotifications").checked,
          dashboardAlerts: document.getElementById("dashboardAlerts").checked,
          incidentUpdates: document.getElementById("incidentUpdates").checked,
          visitorAlerts: document.getElementById("visitorAlerts").checked,
        },
      });
      localStorage.setItem("icn_user", JSON.stringify(response.user));
      ICN.showToast("Мэдэгдлийн тохиргоо хадгалагдлаа", "success");
    } catch (error) {
      ICN.showToast(error.message, "error");
    }
  }

  function bindThemeControls() {
    document.querySelectorAll("[data-theme]").forEach((card) => {
      card.addEventListener("click", () => {
        selectedTheme = card.dataset.theme;
        markSelection("theme", selectedTheme);
        ThemeManager.applyTheme(selectedTheme, selectedAccent);
        saveAppearance();
      });
    });

    document.querySelectorAll("[data-accent]").forEach((card) => {
      card.addEventListener("click", () => {
        selectedAccent = card.dataset.accent;
        markSelection("accent", selectedAccent);
        ThemeManager.applyTheme(selectedTheme, selectedAccent);
        saveAppearance();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindThemeControls();
    document.getElementById("profileForm")?.addEventListener("submit", saveProfile);
    document.getElementById("avatarForm")?.addEventListener("submit", uploadAvatar);
    document.getElementById("passwordForm")?.addEventListener("submit", changePassword);
    document.getElementById("notificationForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      saveNotifications();
    });
    document.getElementById("avatarInput")?.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      updateAvatar(currentUser, URL.createObjectURL(file));
    });
  });

  window.onPageReady = async () => {
    await loadSettings();
  };
})();
