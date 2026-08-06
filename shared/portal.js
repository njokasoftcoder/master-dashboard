(() => {
    "use strict";

    const grid = document.getElementById("grid");
    const status = document.getElementById("status");
    const search = document.getElementById("search");
    const footer = document.getElementById("footerText");

    let programs = [];

    // ---------------------------------------
    // Escape HTML
    // ---------------------------------------
    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    // ---------------------------------------
    // Normalize text
    // ---------------------------------------
    function normalize(value) {
        return String(value ?? "")
            .toLowerCase()
            .trim();
    }

    // ---------------------------------------
    // Program URL
    // ---------------------------------------
    function programUrl(slug) {
        return `./programs/${encodeURIComponent(slug)}/`;
    }

    // ---------------------------------------
    // Build card
    // ---------------------------------------
    function createCard(program) {

        const title = escapeHtml(program.name);

        const icon = program.icon
            ? `<img
                    class="card-icon"
                    src="${escapeHtml(program.icon)}"
                    alt="${title}"
                    loading="lazy"
                    onerror="this.outerHTML='<div class=&quot;icon-fallback&quot;>📁</div>'">`
            : `<div class="icon-fallback">📁</div>`;

        return `
            <a class="card" href="${programUrl(program.slug)}">
                ${icon}
                <div class="card-title">${title}</div>
            </a>
        `;
    }

    // ---------------------------------------
    // Render
    // ---------------------------------------
    function render(list) {

        if (!list.length) {

            grid.innerHTML = "";

            status.style.display = "block";
            status.textContent = "No matching programs found.";

            return;
        }

        grid.innerHTML = list.map(createCard).join("");

        status.style.display = "block";
        status.textContent = `${list.length} Program${list.length === 1 ? "" : "s"}`;
    }

    // ---------------------------------------
    // Search
    // ---------------------------------------
    function filterPrograms(query) {

        query = normalize(query);

        if (!query) {
            render(programs);
            return;
        }

        const filtered = programs.filter(program => {

            const searchable = [

                program.name,

                program.slug,

                program.description,

                program.keywords

            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchable.includes(query);

        });

        render(filtered);
    }

    // ---------------------------------------
    // Initialize
    // ---------------------------------------
    async function init() {

        status.style.display = "block";
        status.textContent = "Loading portal...";

        try {

            const response = await fetch("./programs.json", {
                cache: "no-store"
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const config = await response.json();

            programs = Array.isArray(config.programs)
                ? config.programs
                : [];

            programs.sort((a, b) =>
                a.name.localeCompare(b.name)
            );

            if (config.brand) {
                footer.textContent = `${config.brand} • Hosted on GitHub Pages`;
            }

            render(programs);

            search.addEventListener("input", e => {
                filterPrograms(e.target.value);
            });

            search.focus();

        }
        catch (err) {

            console.error(err);

            status.style.display = "block";

            status.innerHTML = `
                <strong>Unable to load the portal.</strong><br>
                ${escapeHtml(err.message)}
            `;
        }

    }

    init();

})();
