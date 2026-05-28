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
		});
	});

	// Wire up buttons
	definitions.forEach((def) => {
		if (def.type === "button" && def.onClick) {
			const btn = panel.querySelector(`button[data-key="${def.key}"]`);
			if (btn) btn.addEventListener("click", def.onClick);
		}
	});
})();
