const jsonFile = "src/data/data.json";
const urlParams = new URLSearchParams(window.location.search);
const selectedLetter = urlParams.get("letter");

// Toggle hover highlighting: change to false to disable
const HOVER_HIGHLIGHT = true;

// Cached data for search filtering
let allData = [];

function loadTable() {
	console.log("Loading table...");
	console.log("Selected Letter:", selectedLetter);

	fetch(jsonFile)
		.then((response) => {
			if (!response.ok) throw new Error("JSON not found");
			return response.json();
		})
		.then((data) => {
			allData = data.filter(
				(row) => row.TITLE && row.TITLE.trim() !== "",
			);
			if (allData.length === 0) {
				document.getElementById("table-container").innerHTML =
					"<p>No rows with TITEL found in JSON.</p>";
				return;
			}
			renderFromSearch();
			updateAlphabetNavOffset();
		})
		.catch((err) => {
			document.getElementById("table-container").innerHTML =
				`<p>Error loading JSON: ${err}</p>`;
		});
}

function filterBySearch(data, query) {
	if (!query) return data;
	const q = query.toLowerCase();
	return data.filter((row) =>
		Object.values(row).some(
			(val) => val && val.toString().toLowerCase().includes(q),
		),
	);
}

function renderFromSearch() {
	const query = (document.getElementById("search-input").value || "").trim();
	const filtered = filterBySearch(allData, query);
	renderAlphabetNav(filtered);
	renderFileLevel(filtered, "ALL");
}

function initSearch() {
	const input = document.getElementById("search-input");
	if (!input) return;
	input.addEventListener("input", () => {
		renderFromSearch();
		updateAlphabetNavOffset();
		// Re-init image previews for the new table rows
		if (typeof initImagePreview === "function") initImagePreview();
	});
}

function updateAlphabetNavOffset() {
	const nav = document.getElementById("alphabet-nav");
	if (!nav) return;
	const height = nav.offsetHeight;
	document.documentElement.style.setProperty(
		"--alphabet-nav-height",
		`${height}px`,
	);
}

function renderAlphabetNav(data) {
	const nav = document.getElementById("alphabet-nav");
	if (!nav) return;

	const letters = [
		...new Set(data.map((row) => row.TITLE.trim().charAt(0).toUpperCase())),
	].sort();

	nav.innerHTML =
		'<a href="#" data-letter="top">▴</a> ' +
		letters
			.map(
				(letter) =>
					`<a href="#letter-${letter}" data-letter="${letter}">${letter}</a>`,
			)
			.join(" ");

	nav.querySelectorAll("a[data-letter]").forEach((link) => {
		link.addEventListener("click", (event) => {
			event.preventDefault();
			const letter = link.getAttribute("data-letter");
			if (letter === "top") {
				window.scrollTo({ top: 0, behavior: "smooth" });
				return;
			}
			const target = document.getElementById(`letter-${letter}`);
			if (target) {
				target.scrollIntoView({ behavior: "smooth", block: "start" });
			}
		});
	});
}

function renderFileLevel(data, letter) {
	const isAllView = letter === "ALL";
	const dirTitle = isAllView ? "All" : letter;

	const filteredData = isAllView
		? data.sort((a, b) => a.TITLE.localeCompare(b.TITLE))
		: data.filter((row) => row.TITLE.trim().toUpperCase().startsWith(letter))
				.sort((a, b) => a.TITLE.localeCompare(b.TITLE));
	if (filteredData.length === 0) {
		document.getElementById("table-container").innerHTML =
			"<p>No data available for this view.</p>";
		return;
	}

	const headers = Object.keys(filteredData[0]).filter(
		(h) => h !== "ID" && h !== "IMAGE" && h !== "DESCRIPTION",
	);

	let html = "<table";
	if (!HOVER_HIGHLIGHT) {
		html += " class='highlight-disabled'";
	}
	html += "><thead><tr>";
	html += "<th>#</th>";
	headers.forEach((h) => (html += `<th>${h}</th>`));
	html += "</tr></thead><tbody>";

	let currentSection = null;

	filteredData.forEach((row) => {
		const firstLetter = row.TITLE.trim().charAt(0).toUpperCase();
		
		// Add section header when letter changes
		if (firstLetter !== currentSection) {
			currentSection = firstLetter;
			html += `<tr class="letter-row" id="letter-${firstLetter}">`;
			html += "<td></td>";
			html += `<td class="letter"><strong>${firstLetter}</strong></td>`;
			for (let i = 1; i < headers.length; i++) {
				html += "<td></td>";
			}
			html += "</tr>";
		}

		const rowNumber = filteredData.indexOf(row) + 1;
		const imagePath = row.IMAGE ? row.IMAGE.toString().trim() : "";
		const rowJson = JSON.stringify(row).replace(/&/g, '&amp;').replace(/'/g, '&#39;');
		html += `<tr data-image-path="${imagePath}" data-row='${rowJson}'>`;
		html += `<td>${rowNumber}</td>`;
		headers.forEach((h, index) => {
			let content = row[h] ? row[h].toString().trim() : "";
			if (content === "") content = "-";

			const iconClass = index === 0 ? 'class="file-icon"' : "";
			html += `<td ${iconClass}>${content}</td>`;
		});
		html += "</tr>";
	});

	html += "</tbody></table>";
	document.getElementById("table-container").innerHTML = html;
}

function initColumnHighlight() {
	const tableContainer = document.getElementById("table-container");
	if (!tableContainer) return;

	tableContainer.addEventListener("mouseover", (e) => {
		const th = e.target.closest("th");
		if (!th) return;
		const table = th.closest("table");
		if (!table || table.classList.contains("highlight-disabled")) return;

		// Get column index
		const headerRow = th.parentElement;
		const colIndex = Array.from(headerRow.children).indexOf(th);

		// Clear previous highlights
		table.querySelectorAll(".col-highlight").forEach((el) => el.classList.remove("col-highlight"));

		// Highlight all cells in that column
		table.querySelectorAll("tr").forEach((row) => {
			const cell = row.children[colIndex];
			if (cell) cell.classList.add("col-highlight");
		});
	});

	tableContainer.addEventListener("mouseleave", () => {
		tableContainer.querySelectorAll(".col-highlight").forEach((el) => el.classList.remove("col-highlight"));
	});

	// Also clear when mouse leaves the thead area
	tableContainer.addEventListener("mouseout", (e) => {
		if (e.target.closest("th")) {
			const related = e.relatedTarget;
			// If we're no longer over a th, clear highlights
			if (!related || !related.closest("th")) {
				const table = e.target.closest("table");
				if (table) table.querySelectorAll(".col-highlight").forEach((el) => el.classList.remove("col-highlight"));
			}
		}
	});
}

window.onload = () => {
	loadTable();
	initSearch();
	initColumnHighlight();
};
window.addEventListener("resize", updateAlphabetNavOffset);
