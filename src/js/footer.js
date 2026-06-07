/**
 * Shared footer loader — fetches src/partials/footer.html and injects it before </body>.
 * Add <script src="src/js/footer.js"></script> before the closing </body> tag.
 */
fetch("src/partials/footer.html")
	.then((r) => r.text())
	.then((html) => {
		const div = document.createElement("div");
		div.id = "shared-footer";
		div.innerHTML = html;
		document.body.appendChild(div);
	});
