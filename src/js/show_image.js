// Image overlay functionality
let currentImageData = null;
let hoverTimeout = null;

// Create overlay elements
const imagePreview = document.createElement("div");
imagePreview.id = "image-preview";
imagePreview.className = "image-preview";

const imageModal = document.createElement("div");
imageModal.id = "image-modal";
imageModal.className = "image-modal hidden";

document.body.appendChild(imagePreview);
document.body.appendChild(imageModal);

// Close on clicking outside image/data
imageModal.addEventListener("click", (e) => {
	if (!e.target.closest(".modal-image") && !e.target.closest(".modal-data") && !e.target.closest(".scroll-indicator")) {
		closeModal();
	}
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

// Close modal on Escape key
document.addEventListener("keydown", (e) => {
	if (e.key === "Escape") {
		closeModal();
	}
});

function showImagePreview(imagePath, event) {
	if (!imagePath || imagePath === "-") return;

	hoverTimeout = setTimeout(() => {
		const img = new Image();
		img.onload = () => {
			imagePreview.innerHTML = `<img src="${imagePath}" alt="Preview">`;
			imagePreview.style.display = "block";
			imagePreview.offsetHeight;
			imagePreview.classList.add("visible");
		};
		img.onerror = () => {
			imagePreview.innerHTML = `<div class="no-image">no image</div>`;
			imagePreview.style.display = "block";
			imagePreview.offsetHeight;
			imagePreview.classList.add("visible");
		};
		img.src = imagePath;
	}, 300);
}

function positionPreviewBottomLeft() {
	imagePreview.style.left = "20px";
	imagePreview.style.bottom = "20px";
	imagePreview.style.top = "auto";
}

function hideImagePreview() {
	clearTimeout(hoverTimeout);
	imagePreview.classList.remove("visible");
	setTimeout(() => {
		imagePreview.style.display = "none";
		imagePreview.innerHTML = "";
	}, 300);
}

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
	indicator.textContent = "▼";
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
	document.body.style.overflow = "";
	imageModal.classList.remove("visible");
	setTimeout(() => {
		imageModal.scrollTop = 0;
		imageModal.classList.add("hidden");
		imageModal.innerHTML = "";
	}, 300);
}

// Add event listeners to table rows
function initImagePreview() {
	const observer = new MutationObserver(() => {
		const rows = document.querySelectorAll("table tbody tr:not(.letter-row)");

		for (const row of rows) {
			if (row.dataset.imageListenerAdded) continue;
			row.dataset.imageListenerAdded = "true";

			if (row.dataset.imagePath) {
				row.style.cursor = "pointer";
				row.addEventListener("mouseenter", () => {
					positionPreviewBottomLeft();
					showImagePreview(row.dataset.imagePath);
				});

				row.addEventListener("mouseleave", hideImagePreview);

				row.addEventListener("click", () => {
					let rowData = null;
					if (row.dataset.row) {
						try {
							rowData = JSON.parse(row.dataset.row);
						} catch (e) {
							rowData = null;
						}
					}
					openImageModal(row.dataset.imagePath, rowData);
				});
			}
		}

		if (rows.length > 0) {
			observer.disconnect();
		}
	});

	const tableContainer = document.getElementById("table-container");
	observer.observe(tableContainer, { childList: true, subtree: true });
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initImagePreview);
} else {
	initImagePreview();
}
