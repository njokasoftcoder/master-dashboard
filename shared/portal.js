(function () {
  const grid = document.getElementById("grid");
  const statusEl = document.getElementById("status");
  const searchEl = document.getElementById("search");
  const footerText = document.getElementById("footerText");

  let allPrograms = [];

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[m]));
  }

  function normalize(s) {
    return String(s || "").toLowerCase().trim();
  }

  function programUrl(slug) {
    return `programs/${encodeURIComponent(slug)}/`;
  }

  function tile(program) {
    const name = escapeHtml(program.name);
    const href = programUrl(program.slug);

    // If icon file is missing, we still show a fallback icon so you never get “blank”.
    const iconPath = program.icon ? escapeHtml(program.icon) : "";
    const iconHtml = iconPath
      ? `<img class="card-icon" src="${iconPath}" alt="${name} icon" loading="lazy"
             onerror="this.outerHTML='<div class=\\'icon-fallback\\'>⬤</div>'">`
      : `<div class="icon-fallback">⬤</div>`;
