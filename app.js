/* ==========================================================================
   PinForge v0.2 — application logic
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

    image: {
      zoomDefault: 100,
      positionDefault: 50,
    },

    cta: {
      customValue: "custom",
      noneValue: "none",
    },

    successMessageDurationMs: 1400,
    errorMessageDurationMs: 1800,
    headerScrollThresholdPx: 8,
  };

  /* =======================================================================
     2. STYLE PRESETS
     ======================================================================= */

  const STYLE_PRESETS = {
    bottom: {
      wrap:
        "absolute inset-x-0 bottom-0 p-[6%] flex flex-col gap-2 text-left items-start",
      scrim:
        "absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-black/70 via-black/25 to-transparent pointer-events-none",
    },

    center: {
      wrap:
        "absolute inset-x-0 top-1/2 -translate-y-1/2 p-[6%] flex flex-col items-center text-center gap-2",
      scrim: "absolute inset-0 bg-black/35 pointer-events-none",
    },

    top: {
      wrap:
        "absolute inset-x-0 top-0 p-[6%] flex flex-col gap-2 text-left items-start",
      scrim:
        "absolute inset-x-0 top-0 h-[46%] bg-gradient-to-b from-black/70 via-black/25 to-transparent pointer-events-none",
    },
  };

  /* =======================================================================
     3. FONT FAMILIES
     ======================================================================= */

  const FONT_FAMILIES = {
    "league-spartan": "'League Spartan', sans-serif",
    inter: "'Inter', sans-serif",
    "playfair-display": "'Playfair Display', serif",
    "dm-serif-display": "'DM Serif Display', serif",
    poppins: "'Poppins', sans-serif",
    caveat: "'Caveat', cursive",
  };

  /* =======================================================================
     4. ICONS
     ======================================================================= */

  const ICONS = {
    download:
      '<svg id="downloadIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4M12 16l-4-4M12 16l4-4"/><path d="M4 20h16"/></svg>',

    spinner:
      '<svg id="downloadIcon" class="pf-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="9" stroke-opacity="0.3"/><path d="M21 12a9 9 0 0 0-9-9"/></svg>',

    check:
      '<svg id="downloadIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>',
  };

  /* =======================================================================
     5. DOM CACHE
     ======================================================================= */

  const dom = {
    siteHeader: document.getElementById("siteHeader"),

    // Upload
    dropzone: document.getElementById("dropzone"),
    fileInput: document.getElementById("fileInput"),
    removeImageBtn: document.getElementById("removeImageBtn"),
    pinImage: document.getElementById("pinImage"),
    pinPlaceholder: document.getElementById("pinPlaceholder"),

    // Image controls
    zoomSlider: document.getElementById("zoomSlider"),
    zoomValue: document.getElementById("zoomValue"),
    posXSlider: document.getElementById("posXSlider"),
    posYSlider: document.getElementById("posYSlider"),
    resetPositionBtn: document.getElementById("resetPositionBtn"),

    // Text
    headlineInput: document.getElementById("headlineInput"),
    subheadlineInput: document.getElementById("subheadlineInput"),
    headlineCount: document.getElementById("headlineCount"),
    subheadlineCount: document.getElementById("subheadlineCount"),

    pinHeadline: document.getElementById("pinHeadline"),
    pinSubheadline: document.getElementById("pinSubheadline"),

    // Overlay
    styleToggle: document.getElementById("styleToggle"),
    styleTogglePill: document.getElementById("styleTogglePill"),
    pinTextWrap: document.getElementById("pinTextWrap"),
    pinScrim: document.getElementById("pinScrim"),

    // Customize panel
    customizeToggleBtn: document.getElementById("customizeToggleBtn"),
    customizePanel: document.getElementById("customizePanel"),
    customizeChevron: document.getElementById("customizeChevron"),

    // Font
    fontSelector: document.getElementById("fontSelector"),

    // Color
    colorSelector: document.getElementById("colorSelector"),
    customColorSwatch: document.getElementById("customColorSwatch"),
    customColorInput: document.getElementById("customColorInput"),

    // CTA
    ctaSelect: document.getElementById("ctaSelect"),
    ctaCustomInput: document.getElementById("ctaCustomInput"),
    pinCtaWrap: document.getElementById("pinCtaWrap"),
    pinCtaLabel: document.getElementById("pinCtaLabel"),

    // Export
    pinCard: document.getElementById("pinCard"),
    downloadBtn: document.getElementById("downloadBtn"),
    downloadLabel: document.getElementById("downloadLabel"),
    exportGhost: document.getElementById("exportGhost"),
  };

  /* =======================================================================
     6. STATE
     ======================================================================= */

  const state = {
    imageDataUrl: null,

    zoom: CONFIG.image.zoomDefault,
    posX: CONFIG.image.positionDefault,
    posY: CONFIG.image.positionDefault,

    activeStyle: "bottom",
    headlineFont: "league-spartan",
    headlineColor: "#FFFFFF",

    ctaMode: "SHOP ON ETSY",

    isCustomizingOpen: false,
    isExporting: false,
  };

  /* =======================================================================
     7. UTILS
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

        reader.onload = (event) => resolve(event.target.result);
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

    debounce(fn, waitMs) {
      let timer = null;

      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), waitMs);
      };
    },
  };

  /* =======================================================================
     8. IMAGE POSITION
     ======================================================================= */

  const ImagePosition = {
    init() {
      if (dom.zoomSlider) {
        dom.zoomSlider.addEventListener("input", () => this.update());
      }

      if (dom.posXSlider) {
        dom.posXSlider.addEventListener("input", () => this.update());
      }

      if (dom.posYSlider) {
        dom.posYSlider.addEventListener("input", () => this.update());
      }

      if (dom.resetPositionBtn) {
        dom.resetPositionBtn.addEventListener("click", () => this.reset());
      }

      this.reset();
      this.setEnabled(false);
    },

    update() {
      state.zoom = Number(dom.zoomSlider.value);
      state.posX = Number(dom.posXSlider.value);
      state.posY = Number(dom.posYSlider.value);

      this.render();
    },

    reset() {
      state.zoom = CONFIG.image.zoomDefault;
      state.posX = CONFIG.image.positionDefault;
      state.posY = CONFIG.image.positionDefault;

      if (dom.zoomSlider) {
        dom.zoomSlider.value = String(state.zoom);
      }

      if (dom.posXSlider) {
        dom.posXSlider.value = String(state.posX);
      }

      if (dom.posYSlider) {
        dom.posYSlider.value = String(state.posY);
      }

      this.render();
    },

    render() {
      if (!dom.pinImage) return;

      dom.pinImage.style.objectPosition = `${state.posX}% ${state.posY}%`;
      dom.pinImage.style.transform = `scale(${state.zoom / 100})`;
      dom.pinImage.style.transformOrigin = "center center";

      if (dom.zoomValue) {
        dom.zoomValue.textContent = `${state.zoom}%`;
      }
    },

    setEnabled(enabled) {
      [
        dom.zoomSlider,
        dom.posXSlider,
        dom.posYSlider,
        dom.resetPositionBtn,
      ].forEach((element) => {
        if (element) {
          element.disabled = !enabled;
        }
      });
    },
  };

  /* =======================================================================
     9. UPLOAD
     ======================================================================= */

  const Upload = {
    init() {
      if (!dom.fileInput || !dom.dropzone) return;

      dom.fileInput.addEventListener("change", (event) => {
        this.handleFile(event.target.files[0]);
      });

      if (dom.removeImageBtn) {
        dom.removeImageBtn.addEventListener("click", () => this.clear());
      }

      ["dragenter", "dragover"].forEach((eventName) => {
        dom.dropzone.addEventListener(eventName, (event) => {
          event.preventDefault();
          event.stopPropagation();

          dom.dropzone.classList.add("is-dragover");
        });
      });

      ["dragleave", "drop"].forEach((eventName) => {
        dom.dropzone.addEventListener(eventName, (event) => {
          event.preventDefault();
          event.stopPropagation();

          dom.dropzone.classList.remove("is-dragover");
        });
      });

      dom.dropzone.addEventListener("drop", (event) => {
        const file =
          event.dataTransfer.files && event.dataTransfer.files[0];

        this.handleFile(file);
      });

      this.render();
    },

    async handleFile(file) {
      if (!file || !file.type.startsWith("image/")) return;

      try {
        const dataUrl = await utils.readFileAsDataUrl(file);

        state.imageDataUrl = dataUrl;

        if (dom.pinImage) {
          dom.pinImage.src = dataUrl;
        }

        // Every newly uploaded image starts centered at 100% zoom.
        ImagePosition.reset();

        this.render();
      } catch (error) {
        console.error("PinForge image upload failed:", error);
      }
    },

    clear() {
      state.imageDataUrl = null;

      if (dom.fileInput) {
        dom.fileInput.value = "";
      }

      if (dom.pinImage) {
        dom.pinImage.src = "";
      }

      ImagePosition.reset();
      this.render();
    },

    render() {
      const hasImage = Boolean(state.imageDataUrl);

      if (dom.pinImage) {
        dom.pinImage.classList.toggle("hidden", !hasImage);
      }

      if (dom.pinPlaceholder) {
        dom.pinPlaceholder.classList.toggle("hidden", hasImage);
      }

      if (dom.removeImageBtn) {
        dom.removeImageBtn.classList.toggle("hidden", !hasImage);
      }

      ImagePosition.setEnabled(hasImage);

      if (hasImage && dom.pinImage) {
        dom.pinImage.classList.remove("pf-animate-in");

        // Restart upload animation.
        void dom.pinImage.offsetWidth;

        dom.pinImage.classList.add("pf-animate-in");
      }
    },
  };

  /* =======================================================================
     10. TEXT PREVIEW
     ======================================================================= */

  const TextPreview = {
    init() {
      if (dom.headlineInput) {
        dom.headlineInput.addEventListener("input", () => {
          this.sync(
            dom.headlineInput,
            dom.pinHeadline,
            dom.headlineCount,
            CONFIG.text.headlineFallback
          );
        });
      }

      if (dom.subheadlineInput) {
        dom.subheadlineInput.addEventListener("input", () => {
          this.sync(
            dom.subheadlineInput,
            dom.pinSubheadline,
            dom.subheadlineCount,
            CONFIG.text.subheadlineFallback
          );
        });
      }

      this.sync(
        dom.headlineInput,
        dom.pinHeadline,
        dom.headlineCount,
        CONFIG.text.headlineFallback
      );

      this.sync(
        dom.subheadlineInput,
        dom.pinSubheadline,
        dom.subheadlineCount,
        CONFIG.text.subheadlineFallback
      );
    },

    sync(input, previewTarget, counterElement, fallback) {
      if (!input || !previewTarget) return;

      const value = input.value.trim();

      previewTarget.textContent =
        value.length > 0 ? input.value : fallback;

      if (counterElement) {
        counterElement.textContent =
          `${input.value.length}/${input.maxLength}`;
      }
    },
  };

  /* =======================================================================
     11. STYLE TOGGLE
     ======================================================================= */

  const StyleToggle = {
    init() {
      if (!dom.styleToggle) return;

      dom.styleToggle.addEventListener("click", (event) => {
        const button = event.target.closest(".style-btn");

        if (!button) return;

        this.apply(button.dataset.style);
      });

      window.addEventListener(
        "resize",
        utils.debounce(() => this.positionPill(), 100)
      );

      this.apply(state.activeStyle);
    },

    apply(styleKey) {
      const preset = STYLE_PRESETS[styleKey];

      if (!preset) return;

      state.activeStyle = styleKey;

      if (dom.pinTextWrap) {
        dom.pinTextWrap.className = preset.wrap;
      }

      if (dom.pinScrim) {
        dom.pinScrim.className = preset.scrim;
      }

      dom.styleToggle.querySelectorAll(".style-btn").forEach((button) => {
        button.classList.toggle(
          "is-active",
          button.dataset.style === styleKey
        );
      });

      this.positionPill();
    },

    positionPill() {
      if (!dom.styleToggle || !dom.styleTogglePill) return;

      const activeButton =
        dom.styleToggle.querySelector(".style-btn.is-active");

      if (!activeButton) return;

      dom.styleTogglePill.style.width =
        `${activeButton.offsetWidth}px`;

      dom.styleTogglePill.style.transform =
        `translateX(${activeButton.offsetLeft}px)`;
    },
  };

  /* =======================================================================
     12. FONT SELECTOR
     ======================================================================= */

  const FontSelector = {
    init() {
      if (!dom.fontSelector) return;

      dom.fontSelector.addEventListener("click", (event) => {
        const button = event.target.closest(".font-chip");

        if (!button) return;

        this.apply(button.dataset.font);
      });

      this.apply(state.headlineFont);
    },

    apply(fontKey) {
      const family = FONT_FAMILIES[fontKey];

      if (!family) return;

      state.headlineFont = fontKey;

      if (dom.pinHeadline) {
        dom.pinHeadline.style.fontFamily = family;
      }

      dom.fontSelector.querySelectorAll(".font-chip").forEach((button) => {
        button.classList.toggle(
          "is-active",
          button.dataset.font === fontKey
        );
      });
    },
  };

  /* =======================================================================
     13. COLOR SELECTOR
     ======================================================================= */

  const ColorSelector = {
    init() {
      if (!dom.colorSelector) return;

      dom.colorSelector.addEventListener("click", (event) => {
        const button = event.target.closest(
          ".color-swatch:not(.color-swatch--custom)"
        );

        if (!button) return;

        this.apply(button.dataset.color, false);
      });

      if (dom.customColorInput) {
        dom.customColorInput.addEventListener("input", () => {
          this.apply(dom.customColorInput.value, true);
        });
      }

      this.apply(state.headlineColor, false);
    },

    apply(hexColor, isCustom) {
      state.headlineColor = hexColor;

      if (dom.pinHeadline) {
        dom.pinHeadline.style.color = hexColor;
      }

      dom.colorSelector.querySelectorAll(".color-swatch").forEach((element) => {
        const matches = isCustom
          ? element === dom.customColorSwatch
          : element.dataset.color &&
            element.dataset.color.toUpperCase() === hexColor.toUpperCase();

        element.classList.toggle("is-active", Boolean(matches));
      });
    },
  };

  /* =======================================================================
     14. CTA SELECTOR
     ======================================================================= */

  const CtaSelector = {
    init() {
      if (!dom.ctaSelect) return;

      dom.ctaSelect.value = state.ctaMode;

      dom.ctaSelect.addEventListener("change", () => {
        this.applyMode();
      });

      if (dom.ctaCustomInput) {
        dom.ctaCustomInput.addEventListener("input", () => {
          this.render();
        });
      }

      this.applyMode();
    },

    applyMode() {
      state.ctaMode = dom.ctaSelect.value;

      if (dom.ctaCustomInput) {
        dom.ctaCustomInput.classList.toggle(
          "hidden",
          state.ctaMode !== CONFIG.cta.customValue
        );
      }

      this.render();
    },

    render() {
      let text = "";

      if (state.ctaMode === CONFIG.cta.noneValue) {
        text = "";
      } else if (state.ctaMode === CONFIG.cta.customValue) {
        text = dom.ctaCustomInput
          ? dom.ctaCustomInput.value.trim()
          : "";
      } else {
        text = state.ctaMode;
      }

      if (dom.pinCtaWrap) {
        dom.pinCtaWrap.classList.toggle(
          "hidden",
          text.length === 0
        );
      }

      if (dom.pinCtaLabel) {
        dom.pinCtaLabel.textContent = text;
      }
    },
  };

  /* =======================================================================
     15. CUSTOMIZE DISCLOSURE
     ======================================================================= */

  const Disclosure = {
    init() {
      if (!dom.customizeToggleBtn || !dom.customizePanel) return;

      // Starts collapsed.
      state.isCustomizingOpen = false;

      dom.customizePanel.classList.remove("is-open");

      if (dom.customizeChevron) {
        dom.customizeChevron.classList.remove("is-open");
      }

      dom.customizeToggleBtn.setAttribute(
        "aria-expanded",
        "false"
      );

      dom.customizeToggleBtn.addEventListener("click", () => {
        this.toggle();
      });
    },

    toggle() {
      state.isCustomizingOpen = !state.isCustomizingOpen;

      dom.customizePanel.classList.toggle(
        "is-open",
        state.isCustomizingOpen
      );

      if (dom.customizeChevron) {
        dom.customizeChevron.classList.toggle(
          "is-open",
          state.isCustomizingOpen
        );
      }

      dom.customizeToggleBtn.setAttribute(
        "aria-expanded",
        String(state.isCustomizingOpen)
      );
    },
  };

  /* =======================================================================
     16. EXPORTER
     EXACT FINAL FILE SIZE: 1000 × 1500 PX
     ======================================================================= */

  const Exporter = {
    init() {
      if (!dom.downloadBtn) return;

      dom.downloadBtn.addEventListener("click", () => {
        this.run();
      });
    },

    async run() {
      if (state.isExporting || !dom.pinCard) return;

      state.isExporting = true;
      this.setButtonState("loading");

      try {
        const canvas = await this.renderCanvas();

        const fileName =
          utils.slugify(
            dom.headlineInput ? dom.headlineInput.value : "",
            "pinforge-pin"
          ) + ".png";

        utils.downloadDataUrl(
          canvas.toDataURL("image/png"),
          fileName
        );

        this.setButtonState("success");
      } catch (error) {
        console.error("PinForge export failed:", error);
        this.setButtonState("error");
      } finally {
        state.isExporting = false;
      }
    },

    async renderCanvas() {
      const {
        width,
        height,
        headlineFontRatio,
        subheadlineFontRatio,
      } = CONFIG.export;

      // Ensure selected web fonts are fully loaded first.
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      const clone = dom.pinCard.cloneNode(true);

      clone.removeAttribute("id");

      clone.style.width = `${width}px`;
      clone.style.height = `${height}px`;
      clone.style.aspectRatio = "auto";
      clone.style.borderRadius = "0";
      clone.style.boxShadow = "none";
      clone.style.transform = "none";

      const headlineElement =
        clone.querySelector(".pin-headline");

      const subheadlineElement =
        clone.querySelector(".pin-subheadline");

      if (headlineElement) {
        headlineElement.style.fontSize =
          `${width * headlineFontRatio}px`;

        headlineElement.style.fontFamily =
          FONT_FAMILIES[state.headlineFont];

        headlineElement.style.color =
          state.headlineColor;
      }

      if (subheadlineElement) {
        subheadlineElement.style.fontSize =
          `${width * subheadlineFontRatio}px`;
      }

      if (dom.exportGhost) {
        dom.exportGhost.innerHTML = "";
        dom.exportGhost.appendChild(clone);
      }

      await utils.nextFrame();

      /*
       * IMPORTANT:
       * scale MUST remain 1.
       *
       * clone = 1000 × 1500
       * scale = 1
       * output PNG = exactly 1000 × 1500 pixels.
       */
      const canvas = await html2canvas(clone, {
        width,
        height,
        scale: 1,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      if (dom.exportGhost) {
        dom.exportGhost.innerHTML = "";
      }

      return canvas;
    },

    setButtonState(status) {
      if (!dom.downloadBtn || !dom.downloadLabel) return;

      const setIcon = (markup) => {
        const current =
          document.getElementById("downloadIcon");

        if (current) {
          current.outerHTML = markup;
        }
      };

      if (status === "loading") {
        dom.downloadBtn.disabled = true;
        dom.downloadLabel.textContent =
          "Preparing PNG...";

        setIcon(ICONS.spinner);
        return;
      }

      dom.downloadBtn.disabled = false;

      if (status === "success") {
        setIcon(ICONS.check);

        dom.downloadLabel.textContent =
          "Downloaded!";

        dom.downloadBtn.classList.add(
          "pf-success"
        );

        setTimeout(() => {
          setIcon(ICONS.download);

          dom.downloadLabel.textContent =
            "Download PNG";

          dom.downloadBtn.classList.remove(
            "pf-success"
          );
        }, CONFIG.successMessageDurationMs);

        return;
      }

      if (status === "error") {
        setIcon(ICONS.download);

        dom.downloadLabel.textContent =
          "Export failed - try again";

        setTimeout(() => {
          dom.downloadLabel.textContent =
            "Download PNG";
        }, CONFIG.errorMessageDurationMs);

        return;
      }

      setIcon(ICONS.download);
      dom.downloadLabel.textContent =
        "Download PNG";
    },
  };

  /* =======================================================================
     17. HEADER EFFECT
     ======================================================================= */

  const ChromeEffects = {
    init() {
      if (!dom.siteHeader) return;

      const onScroll = () => {
        dom.siteHeader.classList.toggle(
          "is-scrolled",
          window.scrollY >
            CONFIG.headerScrollThresholdPx
        );
      };

      window.addEventListener(
        "scroll",
        onScroll,
        { passive: true }
      );

      onScroll();
    },
  };

  /* =======================================================================
     18. INIT
     ======================================================================= */

  function init() {
    ImagePosition.init();
    Upload.init();
    TextPreview.init();
    StyleToggle.init();
    FontSelector.init();
    ColorSelector.init();
    CtaSelector.init();
    Disclosure.init();
    Exporter.init();
    ChromeEffects.init();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init
    );
  } else {
    init();
  }
})();