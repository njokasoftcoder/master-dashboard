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

    return `
      <a class="card" href="${href}">
        ${iconHtml}
        <div class="card-title">${name}</div>
      </a>
    `;
  }

  function render(programs) {
    grid.innerHTML = "";

    if (!programs.length) {
      statusEl.textContent = "No programs match your search.";
      statusEl.style.display = "block";
      return;
    }

    statusEl.style.display = "none";
    grid.innerHTML = programs.map(tile).join("");
  }

  async function init() {
    statusEl.textContent = "Loading programs…";
    statusEl.style.display = "block";

    try {
      const resp = await fetch("programs.json", { cache: "no-store" });
      if (!resp.ok) throw new Error(`Failed to load programs.json (HTTP ${resp.status})`);

      const data = await resp.json();
      allPrograms = Array.isArray(data.programs) ? data.programs : [];

      if (data.brand) footerText.textContent = `${data.brand} • Hosted on GitHub Pages`;

      const bad = allPrograms.filter(p => !p.name || !p.slug);
      if (bad.length) throw new Error("Config error: each program must have name + slug.");

      render(allPrograms);

      searchEl.addEventListener("input", () => {
        const q = normalize(searchEl.value);
        if (!q) return render(allPrograms);

        const filtered = allPrograms.filter(p => {
          const hay = [p.name, p.slug].map(normalize).join(" ");
          return hay.includes(q);
        });

        render(filtered);
      });

    } catch (e) {
      statusEl.textContent = `Error: ${e.message}`;
      statusEl.style.display = "block";
    }
  }

  init();
})();
