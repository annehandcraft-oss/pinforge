/* ==========================================================================
   PinForge v0.1 — application logic
   No frameworks — plain DOM APIs, organized like a small SaaS codebase.

   Contents:
     1. Config          — constants that describe "what", not "how"
     2. DOM cache        — every element the app touches, looked up once
     3. State            — the app's single source of mutable truth
     4. Utils            — small, pure, reusable helpers
     5. Feature: Upload         — image upload (click + drag & drop)
     6. Feature: TextPreview    — headline / subheadline live sync
     7. Feature: StyleToggle    — segmented overlay-position control
     8. Feature: Exporter       — render the pin to a 1000x1500 PNG
     9. Feature: ChromeEffects  — header scroll shadow (premium nav feel)
    10. Init                    — wire everything up on page load
   ========================================================================== */

(function () {
  "use strict";

  /* =======================================================================
     1. CONFIG
     ======================================================================= */

  const CONFIG = {
    export: {
      width: 1000,
      height: 1500,
      headlineFontRatio: 0.072,
      subheadlineFontRatio: 0.034,
    },
    text: {
      headlineFallback: "Your Headline Here",
      subheadlineFallback: "Add a subheadline for extra detail",
    },
    successMessageDurationMs: 1400,
    errorMessageDurationMs: 1800,
    headerScrollThresholdPx: 8,
  };

  const STYLE_PRESETS = {
    bottom: {
      wrap: "absolute inset-x-0 bottom-0 p-[6%] flex flex-col gap-2",
      scrim:
        "absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-black/70 via-black/25 to-transparent pointer-events-none",
    },
    center: {
      wrap: "absolute inset-x-0 top-1/2 -translate-y-1/2 p-[6%] flex flex-col items-center text-center gap-2",
      scrim: "absolute inset-0 bg-black/35 pointer-events-none",
    },
    top: {
      wrap: "absolute inset-x-0 top-0 p-[6%] flex flex-col gap-2",
      scrim:
        "absolute inset-x-0 top-0 h-[46%] bg-gradient-to-b from-black/70 via-black/25 to-transparent pointer-events-none",
    },
  };

  const ICONS = {
    download:
      '<svg id="downloadIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4M12 16l-4-4M12 16l4-4"/><path d="M4 20h16"/></svg>',
    spinner:
      '<svg id="downloadIcon" class="pf-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="9" stroke-opacity="0.3"/><path d="M21 12a9 9 0 0 0-9-9"/></svg>',
    check:
      '<svg id="downloadIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>',
  };

  /* =======================================================================
     2. DOM CACHE
     ======================================================================= */

  const dom = {
    siteHeader: document.getElementById("siteHeader"),

    dropzone: document.getElementById("dropzone"),
    fileInput: document.getElementById("fileInput"),
    removeImageBtn: document.getElementById("removeImageBtn"),
    pinImage: document.getElementById("pinImage"),
    pinPlaceholder: document.getElementById("pinPlaceholder"),

    headlineInput: document.getElementById("headlineInput"),
    subheadlineInput: document.getElementById("subheadlineInput"),
    headlineCount: document.getElementById("headlineCount"),
    subheadlineCount: document.getElementById("subheadlineCount"),

    pinHeadline: document.getElementById("pinHeadline"),
    pinSubheadline: document.getElementById("pinSubheadline"),

    styleToggle: document.getElementById("styleToggle"),
    styleTogglePill: document.getElementById("styleTogglePill"),
    pinTextWrap: document.getElementById("pinTextWrap"),
    pinScrim: document.getElementById("pinScrim"),

    pinCard: document.getElementById("pinCard"),
    downloadBtn: document.getElementById("downloadBtn"),
    downloadLabel: document.getElementById("downloadLabel"),
    exportGhost: document.getElementById("exportGhost"),
  };

  /* =======================================================================
     3. STATE
     ======================================================================= */

  const state = {
    imageDataUrl: null,
    activeStyle: "bottom",
    isExporting: false,
  };

  /* =======================================================================
     4. UTILS
     ======================================================================= */

  const utils = {
    slugify(text, fallback) {
      const slug = text
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      return slug || fallback;
    },

    readFileAsDataUrl(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
    },

    nextFrame() {
      return new Promise((resolve) => requestAnimationFrame(resolve));
    },

    downloadDataUrl(dataUrl, fileName) {
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    /** Debounce a function so rapid-fire events (e.g. resize) settle first. */
    debounce(fn, waitMs) {
      let timer = null;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), waitMs);
      };
    },
  };

  /* =======================================================================
     5. FEATURE: UPLOAD
     ======================================================================= */

  const Upload = {
    init() {
      dom.fileInput.addEventListener("change", (e) => {
        this.handleFile(e.target.files[0]);
      });

      dom.removeImageBtn.addEventListener("click", () => this.clear());

      ["dragenter", "dragover"].forEach((evt) => {
        dom.dropzone.addEventListener(evt, (e) => {
          e.preventDefault();
          dom.dropzone.classList.add("is-dragover");
        });
      });

      ["dragleave", "drop"].forEach((evt) => {
        dom.dropzone.addEventListener(evt, (e) => {
          e.preventDefault();
          dom.dropzone.classList.remove("is-dragover");
        });
      });

      dom.dropzone.addEventListener("drop", (e) => {
        const file = e.dataTransfer.files && e.dataTransfer.files[0];
        this.handleFile(file);
      });
    },

    async handleFile(file) {
      if (!file || !file.type.startsWith("image/")) return;
      const dataUrl = await utils.readFileAsDataUrl(file);
      state.imageDataUrl = dataUrl;
      this.render();
    },

    clear() {
      state.imageDataUrl = null;
      dom.fileInput.value = "";
      this.render();
    },

    render() {
      const hasImage = Boolean(state.imageDataUrl);
      dom.pinImage.src = state.imageDataUrl || "";
      dom.pinImage.classList.toggle("hidden", !hasImage);
      dom.pinPlaceholder.classList.toggle("hidden", hasImage);
      dom.removeImageBtn.classList.toggle("hidden", !hasImage);
      if (hasImage) dom.pinImage.classList.add("pf-animate-in");
    },
  };

  /* =======================================================================
     6. FEATURE: TEXT PREVIEW
     ======================================================================= */

  const TextPreview = {
    init() {
      dom.headlineInput.addEventListener("input", () =>
        this.sync(dom.headlineInput, dom.pinHeadline, dom.headlineCount, CONFIG.text.headlineFallback)
      );
      dom.subheadlineInput.addEventListener("input", () =>
        this.sync(dom.subheadlineInput, dom.pinSubheadline, dom.subheadlineCount, CONFIG.text.subheadlineFallback)
      );

      this.sync(dom.headlineInput, dom.pinHeadline, dom.headlineCount, CONFIG.text.headlineFallback);
      this.sync(dom.subheadlineInput, dom.pinSubheadline, dom.subheadlineCount, CONFIG.text.subheadlineFallback);
    },

    sync(input, previewTarget, counterEl, fallback) {
      const value = input.value.trim();
      previewTarget.textContent = value.length ? input.value : fallback;
      counterEl.textContent = `${input.value.length}/${input.maxLength}`;
    },
  };

  /* =======================================================================
     7. FEATURE: STYLE TOGGLE
     A segmented control: three buttons plus a sliding pill (absolutely
     positioned, moved with a CSS transform so it animates smoothly).
     ======================================================================= */

  const StyleToggle = {
    init() {
      dom.styleToggle.addEventListener("click", (e) => {
        const btn = e.target.closest(".style-btn");
        if (btn) this.apply(btn.dataset.style);
      });

      // Keep the pill aligned if the layout reflows (e.g. font load, resize).
      window.addEventListener("resize", utils.debounce(() => this.positionPill(), 100));

      this.apply(state.activeStyle);
    },

    apply(styleKey) {
      const preset = STYLE_PRESETS[styleKey];
      if (!preset) return;

      state.activeStyle = styleKey;
      dom.pinTextWrap.className = preset.wrap;
      dom.pinScrim.className = preset.scrim;

      dom.styleToggle.querySelectorAll(".style-btn").forEach((btn) => {
        btn.classList.toggle("is-active", btn.dataset.style === styleKey);
      });

      this.positionPill();
    },

    /** Slide the pill under the currently-active button. */
    positionPill() {
      const activeBtn = dom.styleToggle.querySelector(".style-btn.is-active");
      if (!activeBtn) return;

      dom.styleTogglePill.style.width = `${activeBtn.offsetWidth}px`;
      dom.styleTogglePill.style.transform = `translateX(${activeBtn.offsetLeft}px)`;
    },
  };

  /* =======================================================================
     8. FEATURE: EXPORTER
     ======================================================================= */

  const Exporter = {
    init() {
      dom.downloadBtn.addEventListener("click", () => this.run());
    },

    async run() {
      if (state.isExporting) return;
      state.isExporting = true;
      this.setButtonState("loading");

      try {
        const canvas = await this.renderCanvas();
        const fileName = utils.slugify(dom.headlineInput.value, "pinforge-pin") + ".png";
        utils.downloadDataUrl(canvas.toDataURL("image/png"), fileName);
        this.setButtonState("success");
      } catch (err) {
        console.error("PinForge export failed:", err);
        this.setButtonState("error");
      } finally {
        state.isExporting = false;
      }
    },

    async renderCanvas() {
      const { width, height, headlineFontRatio, subheadlineFontRatio } = CONFIG.export;

      const clone = dom.pinCard.cloneNode(true);
      clone.removeAttribute("id");
      clone.style.width = `${width}px`;
      clone.style.height = `${height}px`;
      clone.style.aspectRatio = "auto";
      clone.style.borderRadius = "0";

      const headlineEl = clone.querySelector(".pin-headline");
      const subheadlineEl = clone.querySelector(".pin-subheadline");
      if (headlineEl) headlineEl.style.fontSize = `${width * headlineFontRatio}px`;
      if (subheadlineEl) subheadlineEl.style.fontSize = `${width * subheadlineFontRatio}px`;

      dom.exportGhost.innerHTML = "";
      dom.exportGhost.appendChild(clone);

      await utils.nextFrame();

      const canvas = await html2canvas(clone, {
        width,
        height,
        scale: 1,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      dom.exportGhost.innerHTML = "";
      return canvas;
    },

    setButtonState(status) {
      const setIcon = (markup) => {
        const current = document.getElementById("downloadIcon");
        if (current) current.outerHTML = markup;
      };

      if (status === "loading") {
        dom.downloadBtn.disabled = true;
        dom.downloadLabel.textContent = "Preparing PNG...";
        setIcon(ICONS.spinner);
        return;
      }

      dom.downloadBtn.disabled = false;

      if (status === "success") {
        setIcon(ICONS.check);
        dom.downloadLabel.textContent = "Downloaded!";
        dom.downloadBtn.classList.add("pf-success");
        setTimeout(() => {
          setIcon(ICONS.download);
          dom.downloadLabel.textContent = "Download PNG";
          dom.downloadBtn.classList.remove("pf-success");
        }, CONFIG.successMessageDurationMs);
        return;
      }

      if (status === "error") {
        setIcon(ICONS.download);
        dom.downloadLabel.textContent = "Export failed - try again";
        setTimeout(() => {
          dom.downloadLabel.textContent = "Download PNG";
        }, CONFIG.errorMessageDurationMs);
        return;
      }

      // idle
      setIcon(ICONS.download);
      dom.downloadLabel.textContent = "Download PNG";
    },
  };

  /* =======================================================================
     9. FEATURE: CHROME EFFECTS
     Small "premium chrome" details that aren't tied to one feature: the
     sticky header gains a shadow once content scrolls beneath it.
     ======================================================================= */

  const ChromeEffects = {
    init() {
      const onScroll = () => {
        dom.siteHeader.classList.toggle("is-scrolled", window.scrollY > CONFIG.headerScrollThresholdPx);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    },
  };

  /* =======================================================================
     10. INIT
     ======================================================================= */

  function init() {
    Upload.init();
    TextPreview.init();
    StyleToggle.init();
    Exporter.init();
    ChromeEffects.init();
  }

  document.addEventListener("DOMContentLoaded", init);
})();

