(function initAuthPage() {
  const demoAccounts = [
    { username: "admin", password: "admin123", label: "admin", role: "Системийн Админ", color: "#f59e0b" },
    { username: "manager", password: "manager123", label: "manager", role: "АБ Менежер", color: "#3b82f6" },
    { username: "staff", password: "staff123", label: "staff", role: "Хамгаалалтын Ажилтан", color: "#10b981" },
  ];

  function renderLoginChips() {
    const container = document.getElementById("loginChipsContainer");
    if (!container) return;

    container.innerHTML = demoAccounts
      .map(
        (account) => `
          <button class="demo-chip" type="button" onclick="fillDemo('${account.username}','${account.password}',this)">
            <span class="chip-dot" style="background:${account.color}"></span>
            <span><strong>${account.label}</strong><br>${account.role}</span>
          </button>
        `
      )
      .join("");
  }

  function fillDemo(username, password, button) {
    document.getElementById("loginUser").value = username;
    document.getElementById("loginPass").value = password;
    clearErr();
    document.querySelectorAll(".demo-chip").forEach((chip) => chip.classList.remove("active"));
    button?.classList.add("active");
  }

  function toggleEye() {
    const password = document.getElementById("loginPass");
    const show = document.getElementById("eyeShow");
    const hide = document.getElementById("eyeHide");
    const visible = password.type === "text";
    password.type = visible ? "password" : "text";
    show.style.display = visible ? "" : "none";
    hide.style.display = visible ? "none" : "";
  }

  function clearErr() {
    document.getElementById("errBox")?.classList.add("hidden");
  }

  function showErr(message) {
    const box = document.getElementById("errBox");
    const text = document.getElementById("errMsg");
    if (box && text) {
      text.textContent = message;
      box.classList.remove("hidden");
    }
  }

  async function doLogin() {
    const username = document.getElementById("loginUser").value.trim();
    const password = document.getElementById("loginPass").value.trim();
    const button = document.getElementById("loginBtn");

    if (!username || !password) {
      showErr("Нэвтрэх нэр болон нууц үгээ оруулна уу.");
      return;
    }

    button.disabled = true;
    button.textContent = "ШАЛГАЖ БАЙНА...";

    try {
      const data = await API.post("/auth/login", { username, password });
      API.setSession(data.token, data.user);

      document.getElementById("mainLoginState").style.display = "none";
      document.getElementById("successState").classList.add("show");
      document.getElementById("suName").textContent = data.user.fullName || data.user.username;
      document.getElementById("suRole").textContent = data.user.role?.label || "";
      requestAnimationFrame(() => {
        document.getElementById("progFill").style.width = "100%";
      });

      setTimeout(() => {
        location.href = "/pages/dashboard.html";
      }, 900);
    } catch (error) {
      showErr(error.message);
      button.disabled = false;
      button.textContent = "НЭВТРЭХ";
    }
  }

  window.onPageReady = async () => {
    renderLoginChips();
    const recordCount = document.getElementById("dbRecordCount");
    try {
      const health = await fetch(`${location.origin}/api/health`).then((res) => res.json());
      document.getElementById("dbStatusTxt").textContent = health.ok
        ? "Backend API идэвхтэй — MongoDB холболт server дээр шалгагдана"
        : "Backend API шалгах боломжгүй";
      if (recordCount) recordCount.textContent = "DB";
    } catch (error) {
      document.getElementById("dbStatusTxt").textContent = "Backend API ажиллаагүй байна";
      document.getElementById("dbStatusBanner").style.color = "var(--orange)";
      document.getElementById("dbStatusBanner").style.borderColor = "rgba(245,158,11,.35)";
    }
  };

  window.fillDemo = fillDemo;
  window.toggleEye = toggleEye;
  window.clearErr = clearErr;
  window.doLogin = doLogin;
})();
