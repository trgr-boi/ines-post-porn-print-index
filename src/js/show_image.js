// Bottom-left hover preview + table row click handlers for index.html
// Requires modal.js to be loaded first (provides openImageModal, getCoverImage, etc.)

let hoverTimeout = null;

// Create preview element
const imagePreview = document.createElement("div");
imagePreview.id = "image-preview";
imagePreview.className = "image-preview";
document.body.appendChild(imagePreview);

function showImagePreview(imagePath) {
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

// Add event listeners to table rows
function initImagePreview() {
	const observer = new MutationObserver(() => {
		const rows = document.querySelectorAll("table tbody tr:not(.letter-row)");

		for (const row of rows) {
			if (row.dataset.imageListenerAdded) continue;
			row.dataset.imageListenerAdded = "true";

			row.style.cursor = "pointer";
			const hasImage = !!row.dataset.imagePath;

			if (hasImage) {
				row.addEventListener("mouseenter", () => {
					positionPreviewBottomLeft();
					showImagePreview(row.dataset.imagePath);
				});

				row.addEventListener("mouseleave", hideImagePreview);
			}

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
