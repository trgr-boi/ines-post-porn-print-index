/**
 * Site-wide configuration with dev overrides.
 *
 * Defaults are defined here. Values can be toggled at runtime via the dev menu,
 * which writes overrides to localStorage.
 *
 * Usage: SITE_CONFIG.scrollAnimation
 */
window.SITE_CONFIG = (function () {
	const STORAGE_KEY = "site-config";

	const defaults = {
		// Whether the shrink/fade animation plays when scrolling down in the modal
		scrollAnimation: true,
	};

	// Merge with any saved overrides
	let saved = {};
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) saved = JSON.parse(raw);
	} catch (e) {
		// ignore
	}

	const config = { ...defaults, ...saved };

	// Save current config to localStorage
	config._save = function () {
		const data = {};
		for (const key in defaults) {
			data[key] = config[key];
		}
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	};

	return config;
})();
