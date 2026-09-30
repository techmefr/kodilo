(function applyStoredTheme() {
	function apply(root) {
		try {
			var stored = localStorage.getItem('kodilo-theme');
			if (stored === 'dark' || stored === 'light') root.dataset.theme = stored;
		} catch {}
	}
	apply(document.documentElement);
	document.addEventListener('astro:before-swap', function (event) {
		apply(event.newDocument.documentElement);
	});
})();
