// Image grid page logic for images.html
// Requires modal.js to be loaded first (provides openImageModal, getCoverImage, etc.)

const jsonFile = "src/data/data.json";
let allData = [];

function loadImageGrid() {
	fetch(jsonFile)
		.then((response) => {
			if (!response.ok) throw new Error("JSON not found");
			return response.json();
		})
		.then((data) => {
			allData = data.filter(
				(row) => row.TITLE && row.TITLE.trim() !== ""
			);
			window._allData = allData;
			renderImageGrid();
		})
		.catch((err) => {
			document.getElementById("images-container").innerHTML =
				`<p>Error loading data: ${err}</p>`;
		});
}

function renderImageGrid(filteredList) {
	const dataToRender = filteredList || [...allData].sort((a, b) => a.TITLE.localeCompare(b.TITLE));
	const container = document.getElementById("images-container");

	let html = '<div class="images-grid">';
	dataToRender.forEach((row) => {
		const imagePath = getCoverImage(row);
		const title = row.TITLE || "";
		const id = row.ID || "";

		html += `<div class="image-card" data-image-path="${imagePath}" data-id="${id}">`;
		html += `<div class="image-card-img">`;
		if (imagePath) {
			html += `<img src="${imagePath}" alt="${title}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\'no-image card-no-image\'>no image</div>'" />`;
		} else {
			html += `<div class="no-image card-no-image">no image</div>`;
		}
		html += `</div>`;
		html += `<div class="image-card-title">${title}</div>`;
		html += `</div>`;
	});
	html += "</div>";

	container.innerHTML = html;

	// Add click listeners
	container.querySelectorAll(".image-card").forEach((card) => {
		card.addEventListener("click", () => {
			const id = card.dataset.id;
			const rowData = allData.find((r) => r.ID === id);
			const imagePath = card.dataset.imagePath;
			openImageModal(imagePath, rowData);
		});
	});
}

function initSearch() {
	const input = document.getElementById("search-input");
	if (!input) return;
	input.addEventListener("input", () => {
		const q = input.value.trim().toLowerCase();
		if (!q) {
			renderImageGrid();
			return;
		}
		const filtered = [...allData]
			.filter((row) =>
				Object.values(row).some(
					(val) => val && val.toString().toLowerCase().includes(q),
				)
			)
			.sort((a, b) => a.TITLE.localeCompare(b.TITLE));
		renderImageGrid(filtered);
	});
}

window.onload = () => {
	loadImageGrid();
	initSearch();
};
