(function () {
  const gridId = "grid";
  const statusId = "status";
  const searchId = "search";
  const footerId = "footerText";

  function $(id) { return document.getElementById(id); }

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

  function render(programs) {
    const grid = $(gridId);
    const statusEl = $(statusId);

    grid.innerHTML = "";

    if (!programs.length) {
      statusEl.textContent = "No programs match your search.";
      statusEl.style.display = "block";
      return;
    }

    statusEl.style.display = "none";

    grid.innerHTML = programs.map(p => {
      const name = escapeHtml(p.name);
      const desc = escapeHtml(p.description || "");
      const tags = Array.isArray(p.tags) ? p.tags : [];
      const tagsHtml = tags.slice(0, 8).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("");
      const href = programUrl(p.slug);

      return `
        <a class="card" href="${href}">
          <div class="card-head">
            <div class="card-title">${name}</div>
            <div class="card-link">Open →</div>
          </div>
          <div class="card-desc">${desc}</div>
          <div class="card-tags">${tagsHtml}</div>
        </a>
      `;
    }).join("");
  }

  async function init() {
    const statusEl = $(statusId);
    const searchEl = $(searchId);
    const footerEl = $(footerId);

    statusEl.textContent = "Loading programs…";
    statusEl.style.display = "block";

    try {
      const resp = await fetch("programs.json", { cache: "no-store" });
      if (!resp.ok) throw new Error(`Failed to load programs.json (HTTP ${resp.status})`);

      const data = await resp.json();
      const allPrograms = Array.isArray(data.programs) ? data.programs : [];

      if (data.brand && footerEl) footerEl.textContent = `${data.brand} • Hosted on GitHub Pages`;

      // basic validation
      const bad = allPrograms.filter(p => !p.name || !p.slug);
      if (bad.length) throw new Error("Config error: each program needs a name and slug in programs.json.");

      render(allPrograms);

      searchEl.addEventListener("input", () => {
        const q = normalize(searchEl.value);
        if (!q) return render(allPrograms);

        const filtered = allPrograms.filter(p => {
          const hay = [
            p.name, p.slug, p.description,
            ...(Array.isArray(p.tags) ? p.tags : [])
          ].map(normalize).join(" ");
          return hay.includes(q);
        });

        render(filtered);
      });

      statusEl.style.display = allPrograms.length ? "none" : "block";
      if (!allPrograms.length) statusEl.textContent = "No programs configured yet.";

    } catch (e) {
      statusEl.textContent = `Error: ${e.message}`;
      statusEl.style.display = "block";
    }
  }

  init();
})();
