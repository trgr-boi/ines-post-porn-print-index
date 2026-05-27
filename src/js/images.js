const jsonFile = "src/data/data.json";

let allData = [];

// Modal elements
const imageModal = document.createElement("div");
imageModal.id = "image-modal";
imageModal.className = "image-modal hidden";

document.body.appendChild(imageModal);

let currentImageIndex = 0;
let currentImages = [];

// Close on clicking outside image/data
imageModal.addEventListener("click", (e) => {
	if (!e.target.closest(".modal-image") && !e.target.closest(".modal-data") && !e.target.closest(".scroll-indicator") && !e.target.closest(".nav-arrow") && !e.target.closest(".peek-image")) {
		closeModal();
	}
});

// Keyboard navigation
document.addEventListener("keydown", (e) => {
	if (imageModal.classList.contains("hidden")) return;

	if (e.key === "Escape") {
		closeModal();
	} else if (e.key === "ArrowRight") {
		navigateImage(1);
	} else if (e.key === "ArrowLeft") {
		navigateImage(-1);
	} else if (e.key === "ArrowDown") {
		e.preventDefault();
		const dataSec = imageModal.querySelector(".modal-data-section");
		if (dataSec) dataSec.scrollIntoView({ behavior: "smooth" });
	} else if (e.key === "ArrowUp") {
		e.preventDefault();
		imageModal.scrollTo({ top: 0, behavior: "smooth" });
	}
});

// Shrink/fade image + toggle scroll indicators on scroll
imageModal.addEventListener("scroll", () => {
	const img = imageModal.querySelector(".modal-image");
	if (!img) return;
	const progress = Math.min(imageModal.scrollTop / window.innerHeight, 1);
	img.style.transform = `scale(${1 - progress * 0.15})`;
	img.style.opacity = 1 - progress * 0.7;

	const peekL = imageModal.querySelector(".peek-left");
	const peekR = imageModal.querySelector(".peek-right");
	if (peekL) peekL.style.opacity = 0.3 - progress * 0.3;
	if (peekR) peekR.style.opacity = 0.3 - progress * 0.3;

	const downIndicator = imageModal.querySelector(".scroll-indicator-down");
	const upIndicator = imageModal.querySelector(".scroll-indicator-up");
	if (downIndicator) downIndicator.style.opacity = Math.max(0, 1 - imageModal.scrollTop / 80);
	if (upIndicator) upIndicator.style.opacity = Math.min(1, Math.max(0, (progress - 0.3) / 0.3));
});

/** Get the cover image (first in the array) from an entry. */
function getCoverImage(row) {
	const images = row.IMAGE;
	if (Array.isArray(images) && images.length > 0) return images[0];
	if (typeof images === "string" && images && images !== "/todo") return images;
	return "";
}

/** Get all images from an entry as an array. */
function getAllImages(row) {
	const images = row.IMAGE;
	if (Array.isArray(images)) return images;
	if (typeof images === "string" && images && images !== "/todo") return [images];
	return [];
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
		["SOURCE", "Source"],
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

function updateModalImages() {
	const imageSection = imageModal.querySelector(".modal-image-section");
	if (!imageSection) return;

	// Main image
	let mainImg = imageSection.querySelector(".modal-image");
	if (!mainImg) {
		mainImg = document.createElement("img");
		mainImg.className = "modal-image";
		mainImg.addEventListener("click", (e) => {
			e.stopPropagation();
			navigateImage(1);
		});
		imageSection.appendChild(mainImg);
	}
	mainImg.src = currentImages[currentImageIndex];
	// Set initial state explicitly so first scroll doesn't glitch
	if (!mainImg.style.transform) mainImg.style.transform = "scale(1)";
	if (!mainImg.style.opacity) mainImg.style.opacity = "1";
	mainImg.onload = () => {
		const noImg = imageSection.querySelector(".no-image");
		if (noImg) noImg.remove();
	};
	mainImg.onerror = () => {
		mainImg.remove();
		let noImg = imageSection.querySelector(".no-image");
		if (!noImg) {
			noImg = document.createElement("div");
			noImg.className = "no-image modal-no-image";
			imageSection.appendChild(noImg);
		}
		noImg.textContent = "no image";
	};

	// Peek left (previous image)
	let peekL = imageSection.querySelector(".peek-left");
	if (currentImageIndex > 0) {
		if (!peekL) {
			peekL = document.createElement("img");
			peekL.className = "peek-image peek-left";
			peekL.addEventListener("click", (e) => {
				e.stopPropagation();
				navigateImage(-1);
			});
			imageSection.appendChild(peekL);
		}
		peekL.src = currentImages[currentImageIndex - 1];
		peekL.style.display = "";
	} else if (peekL) {
		peekL.style.display = "none";
	}

	// Peek right (next image)
	let peekR = imageSection.querySelector(".peek-right");
	if (currentImageIndex < currentImages.length - 1) {
		if (!peekR) {
			peekR = document.createElement("img");
			peekR.className = "peek-image peek-right";
			peekR.addEventListener("click", (e) => {
				e.stopPropagation();
				navigateImage(1);
			});
			imageSection.appendChild(peekR);
		}
		peekR.src = currentImages[currentImageIndex + 1];
		peekR.style.display = "";
	} else if (peekR) {
		peekR.style.display = "none";
	}

	updateNavArrows();
}

function updateNavArrows() {
	const leftArrow = imageModal.querySelector(".nav-arrow-left");
	const rightArrow = imageModal.querySelector(".nav-arrow-right");
	if (leftArrow) leftArrow.style.display = currentImageIndex > 0 ? "" : "none";
	if (rightArrow) rightArrow.style.display = currentImageIndex < currentImages.length - 1 ? "" : "none";

	const counter = imageModal.querySelector(".image-counter");
	if (counter) {
		if (currentImages.length > 1) {
			counter.textContent = `${currentImageIndex + 1} / ${currentImages.length}`;
			counter.style.display = "";
		} else {
			counter.style.display = "none";
		}
	}
}

function navigateImage(direction) {
	const newIndex = currentImageIndex + direction;
	if (newIndex < 0 || newIndex >= currentImages.length) return;
	currentImageIndex = newIndex;
	updateModalImages();
}

function getScrollbarWidth() {
	return window.innerWidth - document.documentElement.clientWidth;
}

function openImageModal(imagePath, rowData) {
	currentImages = rowData ? getAllImages(rowData) : (imagePath ? [imagePath] : []);
	currentImageIndex = 0;

	imageModal.innerHTML = "";

	// Image section
	const imageSection = document.createElement("div");
	imageSection.className = "modal-image-section";
	imageModal.appendChild(imageSection);

	if (currentImages.length > 0) {
		updateModalImages();
	} else {
		const noImg = document.createElement("div");
		noImg.className = "no-image modal-no-image";
		noImg.textContent = "no image";
		imageSection.appendChild(noImg);
	}

	// Navigation arrows
	const leftArrow = document.createElement("div");
	leftArrow.className = "nav-arrow nav-arrow-left";
	leftArrow.innerHTML = "▼";
	leftArrow.addEventListener("click", (e) => {
		e.stopPropagation();
		navigateImage(-1);
	});

	const rightArrow = document.createElement("div");
	rightArrow.className = "nav-arrow nav-arrow-right";
	rightArrow.innerHTML = "▼";
	rightArrow.addEventListener("click", (e) => {
		e.stopPropagation();
		navigateImage(1);
	});

	// Image counter
	const counter = document.createElement("div");
	counter.className = "image-counter";

	imageModal.appendChild(leftArrow);
	imageModal.appendChild(rightArrow);
	imageModal.appendChild(counter);

	// Data section
	const dataSection = document.createElement("div");
	dataSection.className = "modal-data-section";
	dataSection.innerHTML = buildModalDataHTML(rowData);

	// Scroll down indicator
	const downIndicator = document.createElement("div");
	downIndicator.className = "scroll-indicator scroll-indicator-down";
	downIndicator.textContent = "▼";
	downIndicator.addEventListener("click", () => {
		const dataSec = imageModal.querySelector(".modal-data-section");
		if (dataSec) dataSec.scrollIntoView({ behavior: "smooth" });
	});

	// Scroll up indicator
	const upIndicator = document.createElement("div");
	upIndicator.className = "scroll-indicator scroll-indicator-up";
	upIndicator.textContent = "▲";
	upIndicator.style.opacity = 0;
	upIndicator.addEventListener("click", () => {
		imageModal.scrollTo({ top: 0, behavior: "smooth" });
	});

	imageModal.appendChild(dataSection);
	imageModal.appendChild(downIndicator);
	imageModal.appendChild(upIndicator);

	imageModal.scrollTop = 0;
	updateNavArrows();

	imageModal.classList.remove("hidden");
	imageModal.offsetHeight;
	imageModal.classList.add("visible");
	const scrollbarW = getScrollbarWidth();
	document.body.style.overflow = "hidden";
	document.body.style.paddingRight = scrollbarW + "px";
}

function closeModal() {
	document.body.style.overflow = "";
	document.body.style.paddingRight = "";
	imageModal.classList.remove("visible");
	currentImages = [];
	currentImageIndex = 0;
	setTimeout(() => {
		imageModal.scrollTop = 0;
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
