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
		// {
		// 	key: "scrollAnimation",
		// 	label: "Scroll animation",
		// 	type: "checkbox",
		// },
	];

	let html = '<div class="dev-menu-header"><span>dev</span></div>';
	html += '<div class="dev-menu-body">';
	definitions.forEach((def) => {
		const checked = config[def.key] ? "checked" : "";
		html += `<label class="dev-menu-item">
			<input type="checkbox" data-key="${def.key}" ${checked} />
			<span>${def.label}</span>
		</label>`;
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
})();
