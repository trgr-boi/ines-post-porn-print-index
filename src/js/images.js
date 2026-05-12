const jsonFile = "src/data/data.json";

let allData = [];

// Modal elements
const imageModal = document.createElement("div");
imageModal.id = "image-modal";
imageModal.className = "image-modal hidden";

document.body.appendChild(imageModal);

// Close on clicking outside image/data
imageModal.addEventListener("click", (e) => {
	if (!e.target.closest(".modal-image") && !e.target.closest(".modal-data") && !e.target.closest(".scroll-indicator")) {
		closeModal();
	}
});
document.addEventListener("keydown", (e) => {
	if (e.key === "Escape") closeModal();
});

// Shrink/fade image + hide scroll indicator on scroll
imageModal.addEventListener("scroll", () => {
	const img = imageModal.querySelector(".modal-image");
	if (!img) return;
	const progress = Math.min(imageModal.scrollTop / window.innerHeight, 1);
	img.style.transform = `scale(${1 - progress * 0.15})`;
	img.style.opacity = 1 - progress * 0.7;

	const indicator = imageModal.querySelector(".scroll-indicator");
	if (indicator) indicator.style.opacity = Math.max(0, 1 - imageModal.scrollTop / 80);
});

function buildModalDataHTML(rowData) {
	if (!rowData) return "";
	const fields = [
		["TITLE", "Title"],
		["ISSUE NUMBER", "Issue"],
		["AUTHOR(S)", "Author(s)"],
		["TYPE", "Type"],
		["PLACE", "Place"],
		["YEAR", "Year"],
		["DESCRIPTION", "Description"],
		["PUBLISHER", "Publisher"],
		["PRINT DETAILS", "Print Details"],
	];
	let html = '<div class="modal-data">';
	fields.forEach(([key, label]) => {
		const val = (rowData[key] || "").trim();
		if (val) {
			html += `<div class="modal-data-row"><span class="modal-data-label">${label}</span><span class="modal-data-value">${val}</span></div>`;
		}
	});
	html += "</div>";
	return html;
}

function openImageModal(imagePath, rowData) {
	if (!imagePath || imagePath === "-") return;

	imageModal.innerHTML = "";

	// Image section (sticky, stays at top)
	const imageSection = document.createElement("div");
	imageSection.className = "modal-image-section";

	const img = new Image();
	img.onload = () => {
		imageSection.appendChild(img);
	};
	img.onerror = () => {
		const noImageDiv = document.createElement("div");
		noImageDiv.className = "no-image modal-no-image";
		noImageDiv.textContent = "no image";
		imageSection.appendChild(noImageDiv);
	};
	img.src = imagePath;
	img.className = "modal-image";

	// Data section (scrolls up over the image)
	const dataSection = document.createElement("div");
	dataSection.className = "modal-data-section";
	dataSection.innerHTML = buildModalDataHTML(rowData);

	// Scroll indicator
	const indicator = document.createElement("div");
	indicator.className = "scroll-indicator";
	indicator.textContent = "↓";
	indicator.addEventListener("click", () => {
		const dataSec = imageModal.querySelector(".modal-data-section");
		if (dataSec) dataSec.scrollIntoView({ behavior: "smooth" });
	});

	imageModal.appendChild(imageSection);
	imageModal.appendChild(dataSection);
	imageModal.appendChild(indicator);

	// Reset scroll so image is visible first
	imageModal.scrollTop = 0;

	imageModal.classList.remove("hidden");
	imageModal.offsetHeight;
	imageModal.classList.add("visible");
	document.body.style.overflow = "hidden";
}

function closeModal() {
	imageModal.scrollTop = 0;
	document.body.style.overflow = "";
	imageModal.classList.remove("visible");
	setTimeout(() => {
		imageModal.classList.add("hidden");
		imageModal.innerHTML = "";
	}, 300);
}

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
			renderImageGrid();
		})
		.catch((err) => {
			document.getElementById("images-container").innerHTML =
				`<p>Error loading data: ${err}</p>`;
		});
}

function checkImageExists(imagePath) {
	return new Promise((resolve) => {
		if (!imagePath || imagePath === "-") {
			resolve(false);
			return;
		}
		const img = new Image();
		img.onload = () => resolve(true);
		img.onerror = () => resolve(false);
		img.src = imagePath;
	});
}

function renderImageGrid(filteredList) {
	const dataToRender = filteredList || [...allData].sort((a, b) => a.TITLE.localeCompare(b.TITLE));
	const container = document.getElementById("images-container");

	let html = '<div class="images-grid">';
	dataToRender.forEach((row) => {
		const imagePath = row.IMAGE ? row.IMAGE.toString().trim() : "";
		if (!imagePath) return;

		const title = row.TITLE || "";
		const id = row.ID || "";

		html += `<div class="image-card" data-image-path="${imagePath}" data-id="${id}">`;
		html += `<div class="image-card-img">`;
		html += `<img src="${imagePath}" alt="${title}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\'no-image card-no-image\'>no image</div>'" />`;
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
