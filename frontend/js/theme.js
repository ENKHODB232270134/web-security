(function initThemeSystem() {
  const THEME_KEY = "icn_theme_preference";
  const ACCENT_KEY = "icn_accent_color";
  const themes = ["dark", "light", "system"];
  const accents = ["blue", "green", "purple", "orange", "red"];
  const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
  let transitionTimer;

  function normalize(value, list, fallback) {
    return list.includes(value) ? value : fallback;
  }

  function getPreference() {
    return normalize(localStorage.getItem(THEME_KEY), themes, "dark");
  }

  function getAccent() {
    return normalize(localStorage.getItem(ACCENT_KEY), accents, "blue");
  }

  function resolveTheme(theme) {
    if (theme === "system") {
      return mediaQuery.matches ? "light" : "dark";
    }

    return theme;
  }

  function startThemeTransition() {
    document.body.classList.add("theme-changing");
    window.clearTimeout(transitionTimer);
    transitionTimer = window.setTimeout(() => {
      document.body.classList.remove("theme-changing");
    }, 280);
  }

  function applyTheme(theme = getPreference(), accent = getAccent(), options = {}) {
    const normalizedTheme = normalize(theme, themes, "dark");
    const normalizedAccent = normalize(accent, accents, "blue");
    const resolvedTheme = resolveTheme(normalizedTheme);

    if (!options.silent) {
      startThemeTransition();
    }

    document.body.classList.remove(...themes.map((item) => `theme-${item}`));
    document.body.classList.remove(...accents.map((item) => `accent-${item}`));
    document.body.classList.remove("theme-resolved-light", "theme-resolved-dark");

    document.body.classList.add(
      `theme-${normalizedTheme}`,
      `theme-resolved-${resolvedTheme}`,
      `accent-${normalizedAccent}`
    );

    document.body.dataset.themePreference = normalizedTheme;
    document.body.dataset.resolvedTheme = resolvedTheme;
    document.body.dataset.accentColor = normalizedAccent;

    localStorage.setItem(THEME_KEY, normalizedTheme);
    localStorage.setItem(ACCENT_KEY, normalizedAccent);
  }

  function applyFromUser(user) {
    applyTheme(user?.themePreference || getPreference(), user?.accentColor || getAccent(), { silent: true });
  }

  function refreshSystemTheme() {
    if (getPreference() === "system") {
      applyTheme("system", getAccent(), { silent: true });
    }
  }

  if (document.body) {
    applyTheme(getPreference(), getAccent(), { silent: true });
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyTheme(getPreference(), getAccent(), { silent: true });
  });

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener("change", refreshSystemTheme);
  } else if (mediaQuery.addListener) {
    mediaQuery.addListener(refreshSystemTheme);
  }

  window.ThemeManager = {
    applyTheme,
    applyFromUser,
    getPreference,
    getAccent,
    resolveTheme,
  };
})();
