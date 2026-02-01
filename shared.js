(function () {
  function saveScroll(key) {
    if (!key) return;
    localStorage.setItem(key, String(window.scrollY || 0));
  }

  function restoreScroll(key) {
    if (!key) return;
    const raw = localStorage.getItem(key);
    const value = raw ? Number(raw) : 0;
    if (!Number.isNaN(value)) {
      window.scrollTo(0, value);
    }
  }

  function setupScrollPersistence(options = {}) {
    const key = options.key || "scroll-pos";
    const debounceMs = options.debounceMs ?? 150;
    let timer = null;
    window.addEventListener("scroll", () => {
      clearTimeout(timer);
      timer = setTimeout(() => saveScroll(key), debounceMs);
    });
    window.addEventListener("load", () => restoreScroll(key));
  }

  function setupAutoReload(options = {}) {
    const intervalMs = options.intervalMs ?? 4000;
    const beforeReload = options.beforeReload;
    const scrollKey = options.scrollKey || "scroll-pos";
    const host = window.location.hostname;
    const protocol = window.location.protocol;
    const shouldReload =
      protocol === "file:" || host === "localhost" || host === "127.0.0.1";

    setupScrollPersistence({ key: scrollKey });
    if (!shouldReload) {
      return;
    }
    setInterval(() => {
      if (typeof beforeReload === "function") {
        beforeReload();
      }
      saveScroll(scrollKey);
      location.reload();
    }, intervalMs);
  }

  function setupZoomPersistence(options = {}) {
    const key = options.key || "pops-zoom";
    const debounceMs = options.debounceMs ?? 150;
    let timer = null;

    function readStoredZoom() {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch (error) {
        const value = Number(raw);
        if (!Number.isFinite(value)) return null;
        return { target: value };
      }
    }

    function storeZoom(target) {
      const payload = {
        target,
        screenW: window.screen?.width ?? null,
        screenH: window.screen?.height ?? null,
      };
      localStorage.setItem(key, JSON.stringify(payload));
    }

    function readCssZoom() {
      const raw = document.documentElement.style.zoom;
      const value = raw ? Number(raw) : 1;
      return Number.isFinite(value) && value > 0 ? value : 1;
    }

    function writeCssZoom(value) {
      document.documentElement.style.zoom = String(value);
    }

    function saveTargetZoom() {
      const target = (window.devicePixelRatio || 1) * readCssZoom();
      storeZoom(target);
    }

    function applyTargetZoom() {
      const stored = readStoredZoom();
      if (!stored || !Number.isFinite(stored.target)) return;
      if (
        Number.isFinite(stored.screenW) &&
        Number.isFinite(stored.screenH) &&
        (stored.screenW !== window.screen?.width || stored.screenH !== window.screen?.height)
      ) {
        writeCssZoom(1);
        return;
      }
      const current = (window.devicePixelRatio || 1) * readCssZoom();
      if (Math.abs(stored.target - current) < 0.01) return;
      const next = stored.target / (window.devicePixelRatio || 1);
      writeCssZoom(next);
    }

    function scheduleSave() {
      clearTimeout(timer);
      timer = setTimeout(saveTargetZoom, debounceMs);
    }

    window.addEventListener("load", () => {
      applyTargetZoom();
      scheduleSave();
    });
    window.addEventListener("resize", scheduleSave);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", scheduleSave);
    }
  }

  window.PopsShared = {
    setupAutoReload,
    setupScrollPersistence,
    setupZoomPersistence,
    saveScroll,
    restoreScroll,
  };
})();
