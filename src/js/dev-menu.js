/**
 * Dev menu — a collapsible panel at the bottom of the page.
 * Loads config from SITE_CONFIG (config.js) and renders toggles.
 * Add <script src="src/js/config.js"></script> and <script src="src/js/dev-menu.js"></script>
 * before the closing </body> tag.
 */
(function () {
	const config = window.SITE_CONFIG;
	if (!config) return;

	const panel = document.createElement("div");
	panel.id = "dev-menu";

	const definitions = [
		{
			key: "showMissingImages",
			label: "Only missing images",
			type: "checkbox",
		},
		{
			key: "previewAllImages",
			label: "Load all images",
			type: "button",
			onClick: () => {
				const data = window._allData || [];
				const images = data.flatMap((row) => Array.isArray(row.IMAGE) ? row.IMAGE : []);
				let loaded = 0;
				const total = images.length;
				if (total === 0) return;
				const label = panel.querySelector('.dev-menu-item[data-key="previewAllImages"] span');
				const origText = label.textContent;
				label.textContent = `Loading 0/${total}...`;
				images.forEach((src) => {
					const img = new Image();
					img.onload = img.onerror = () => {
						loaded++;
						label.textContent = `Loading ${loaded}/${total}...`;
						if (loaded === total) {
							label.textContent = `${total} loaded`;
							setTimeout(() => { label.textContent = origText; }, 2000);
						}
					};
					img.src = src;
				});
			},
		},
	];

	let html = '<div class="dev-menu-header"><span>dev</span></div>';
	html += '<div class="dev-menu-body">';
	definitions.forEach((def) => {
		if (def.type === "checkbox") {
			const checked = config[def.key] ? "checked" : "";
			html += `<label class="dev-menu-item" data-key="${def.key}">
				<input type="checkbox" data-key="${def.key}" ${checked} />
				<span>${def.label}</span>
			</label>`;
		} else if (def.type === "button") {
			html += `<div class="dev-menu-item" data-key="${def.key}">
				<button class="dev-menu-btn" data-key="${def.key}">${def.label}</button>
			</div>`;
		}
	});
	html += "</div>";

	panel.innerHTML = html;
	document.body.appendChild(panel);

	// Toggle body visibility
	const header = panel.querySelector(".dev-menu-header");
	const body = panel.querySelector(".dev-menu-body");
	let open = false;
	body.style.display = "none";

	header.addEventListener("click", () => {
		open = !open;
		body.style.display = open ? "" : "none";
	});

	// Wire up toggles
	panel.querySelectorAll("input[data-key]").forEach((input) => {
		input.addEventListener("change", () => {
			config[input.dataset.key] = input.checked;
			config._save();

			if (input.dataset.key === "showMissingImages") {
				applyMissingImagesFilter(input.checked);
			}
		});
	});

	// Apply initial state
	if (config.showMissingImages) {
		applyMissingImagesFilter(true);
	}

	function applyMissingImagesFilter(active) {
		// Index page: filter table rows
		const tableRows = document.querySelectorAll("table tbody tr:not(.letter-row)");
		if (tableRows.length > 0) {
			// First pass: hide/show data rows
			tableRows.forEach((row) => {
				if (active) {
					const hasImage = row.dataset.imagePath && row.dataset.imagePath.trim() !== "";
					row.style.display = hasImage ? "none" : "";
				} else {
					row.style.display = "";
				}
			});

			// Second pass: hide letter rows with no visible data rows below them
			const letterRows = document.querySelectorAll("table tbody tr.letter-row");
			letterRows.forEach((letterRow) => {
				if (!active) {
					letterRow.style.display = "";
					return;
				}
				// Check if any visible data row follows this letter row before the next letter row
				let sibling = letterRow.nextElementSibling;
				let hasVisible = false;
				while (sibling && !sibling.classList.contains("letter-row")) {
					if (sibling.style.display !== "none") {
						hasVisible = true;
						break;
					}
					sibling = sibling.nextElementSibling;
				}
				letterRow.style.display = hasVisible ? "" : "none";
			});
		}

		// Images page: filter cards
		const cards = document.querySelectorAll(".image-card");
		if (cards.length > 0) {
			const data = window._allData || [];
			cards.forEach((card) => {
				if (active) {
					const rowData = data.find((r) => r.ID === card.dataset.id);
					const imgs = rowData ? (Array.isArray(rowData.IMAGE) ? rowData.IMAGE : []) : [];
					const hasImage = imgs.length > 0;
					card.style.display = hasImage ? "none" : "";
				} else {
					card.style.display = "";
				}
			});
		}
	}

	// Wire up buttons
	definitions.forEach((def) => {
		if (def.type === "button" && def.onClick) {
			const btn = panel.querySelector(`button[data-key="${def.key}"]`);
			if (btn) btn.addEventListener("click", def.onClick);
		}
	});
})();
