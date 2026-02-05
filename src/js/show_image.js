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

const modalContent = document.createElement("div");
modalContent.className = "modal-content";

const modalImage = document.createElement("img");
modalImage.className = "modal-image";

const closeBtn = document.createElement("button");
closeBtn.className = "modal-close";
closeBtn.textContent = "✕";

modalContent.appendChild(modalImage);
modalContent.appendChild(closeBtn);
imageModal.appendChild(modalContent);

document.body.appendChild(imagePreview);
document.body.appendChild(imageModal);

// Close modal on close button click
closeBtn.addEventListener("click", closeModal);

// Close modal on background click
imageModal.addEventListener("click", (e) => {
	if (e.target === imageModal) {
		closeModal();
	}
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
			// Trigger reflow to enable transition
			imagePreview.offsetHeight;
			imagePreview.classList.add("visible");
		};
		img.onerror = () => {
			imagePreview.innerHTML = `<div class="no-image">no image</div>`;
			imagePreview.style.display = "block";
			// Trigger reflow to enable transition
			imagePreview.offsetHeight;
			imagePreview.classList.add("visible");
		};
		img.src = imagePath;
	}, 300); // 300ms delay before showing preview
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

function openImageModal(imagePath) {
	if (!imagePath || imagePath === "-") return;

	const img = new Image();
	img.onload = () => {
		img.style.display = "block";
		modalContent.innerHTML = "";
		modalContent.appendChild(img);
		modalContent.appendChild(closeBtn);
		imageModal.classList.remove("hidden");
		// Trigger reflow to enable transition
		imageModal.offsetHeight;
		imageModal.classList.add("visible");
	};
	img.onerror = () => {
		const noImageDiv = document.createElement("div");
		noImageDiv.className = "no-image modal-no-image";
		noImageDiv.textContent = "no image";
		modalContent.innerHTML = "";
		modalContent.appendChild(noImageDiv);
		modalContent.appendChild(closeBtn);
		imageModal.classList.remove("hidden");
		// Trigger reflow to enable transition
		imageModal.offsetHeight;
		imageModal.classList.add("visible");
	};
	img.src = imagePath;
	img.className = "modal-image";
}

function closeModal() {
	imageModal.classList.remove("visible");
	setTimeout(() => {
		imageModal.classList.add("hidden");
		modalImage.src = "";
	}, 300);
}

// Add event listeners to table rows
function initImagePreview() {
	// Wait for table to be rendered, then add listeners
	const observer = new MutationObserver(async () => {
		const rows = document.querySelectorAll("table tbody tr:not(.letter-row)");

		for (const row of rows) {
			// Get image path from data attribute if available
			if (row.dataset.imagePath) {
				const imageExists = await checkImageExists(row.dataset.imagePath);
				
				if (imageExists) {
					row.style.cursor = "pointer";
					row.addEventListener("mouseenter", (e) => {
						positionPreviewBottomLeft();
						showImagePreview(row.dataset.imagePath, e);
					});

					row.addEventListener("mouseleave", hideImagePreview);

					row.addEventListener("click", () => {
						openImageModal(row.dataset.imagePath);
					});
				}
			}
		}

		// Stop observing once rows are found
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
