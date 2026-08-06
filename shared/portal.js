(function () {
    "use strict";

    const grid = document.getElementById("grid");
    const statusEl = document.getElementById("status");
    const searchEl = document.getElementById("search");
    const footerText = document.getElementById("footerText");

    let allPrograms = [];

    // Escape HTML
    function escapeHtml(s) {
        return String(s ?? "").replace(/[&<>"']/g, (m) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[m]);
    }

    function normalize(s) {
        return String(s ?? "").toLowerCase().trim();
    }

    // KEEP THE ORIGINAL URL FORMAT
    function programUrl(slug) {
        return `programs/${encodeURIComponent(slug)}/`;
    }

    function tile(program) {

        const name = escapeHtml(program.name);
        const href = programUrl(program.slug);

        const iconPath = program.icon
            ? escapeHtml(program.icon)
            : "";

        const iconHtml = iconPath
            ? `<img class="card-icon"
                    src="${iconPath}"
                    alt="${name} icon"
                    loading="lazy"
                    onerror="this.outerHTML='<div class=&quot;icon-fallback&quot;>📁</div>'">`
            : `<div class="icon-fallback">📁</div>`;

        return `
            <a class="card" href="${href}">
                ${iconHtml}
                <div class="card-title">${name}</div>
            </a>
        `;
    }

    function render(programs) {

        if (!programs.length) {

            grid.innerHTML = "";

            statusEl.style.display = "block";
            statusEl.textContent = "No programs match your search.";

            return;
        }

        statusEl.style.display = "block";
        statusEl.textContent = `${programs.length} Program${programs.length === 1 ? "" : "s"}`;

        grid.innerHTML = programs.map(tile).join("");
    }

    async function init() {

        statusEl.style.display = "block";
        statusEl.textContent = "Loading programs...";

        try {

            const response = await fetch("programs.json", {
                cache: "no-store"
            });

            if (!response.ok) {
                throw new Error(`Failed to load programs.json (HTTP ${response.status})`);
            }

            const data = await response.json();

            allPrograms = Array.isArray(data.programs)
                ? data.programs
                : [];

            // Sort alphabetically
            allPrograms.sort((a, b) =>
                a.name.localeCompare(b.name)
            );

            if (data.brand) {
                footerText.textContent =
                    `${data.brand} • Hosted on GitHub Pages`;
            }

            const bad = allPrograms.filter(p => !p.name || !p.slug);

            if (bad.length) {
                throw new Error("Each program must contain both 'name' and 'slug'.");
            }

            render(allPrograms);

            searchEl.addEventListener("input", function () {

                const q = normalize(searchEl.value);

                if (!q) {
                    render(allPrograms);
                    return;
                }

                const filtered = allPrograms.filter(program => {

                    const searchable = [

                        program.name,

                        program.slug,

                        program.description || "",

                        program.keywords || ""

                    ].map(normalize).join(" ");

                    return searchable.includes(q);

                });

                render(filtered);

            });

        }
        catch (err) {

            console.error(err);

            statusEl.style.display = "block";

            statusEl.innerHTML = `
                <strong>Unable to load the portal.</strong><br>
                ${escapeHtml(err.message)}
            `;
        }
    }

    init();

})();
