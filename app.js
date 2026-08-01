/* ==========================================================================
   PinForge v0.2 — app.js
   Matches current index.html + style.css
   ========================================================================== */

(function () {
  "use strict";

  /* ==========================================================================
     CONFIG
     ========================================================================== */

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
    headerScrollThresholdPx: 8,
  };

  /* ==========================================================================
     OVERLAY PRESETS
     ========================================================================== */

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
      scrim:
        "absolute inset-0 bg-black/35 pointer-events-none",
    },

    top: {
      wrap:
        "absolute inset-x-0 top-0 p-[6%] flex flex-col gap-2 text-left items-start",
      scrim:
        "absolute inset-x-0 top-0 h-[46%] bg-gradient-to-b from-black/70 via-black/25 to-transparent pointer-events-none",
    },
  };

  /* ==========================================================================
     FONT FAMILIES
     ========================================================================== */

  const FONT_FAMILIES = {
    "league-spartan": "'League Spartan', sans-serif",
    inter: "'Inter', sans-serif",
    "playfair-display": "'Playfair Display', serif",
    "dm-serif-display": "'DM Serif Display', serif",
    poppins: "'Poppins', sans-serif",
    caveat: "'Caveat', cursive",
  };

  /* ==========================================================================
     ICONS
     ========================================================================== */

  const ICONS = {
    download: `
      <svg width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="white" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 16V4M12 16l-4-4M12 16l4-4"/>
        <path d="M4 20h16"/>
      </svg>
    `,

    spinner: `
      <svg class="pf-spin" width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="white" stroke-width="2">
        <circle cx="12" cy="12" r="9" stroke-opacity="0.3"/>
        <path d="M21 12a9 9 0 0 0-9-9"/>
      </svg>
    `,

    check: `
      <svg width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="white" stroke-width="2.5"
        stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 13l4 4L19 7"/>
      </svg>
    `,
  };

  /* ==========================================================================
     DOM CACHE
     ========================================================================== */

  const dom = {
    siteHeader: document.getElementById("siteHeader"),

    // Upload
    dropzone: document.getElementById("dropzone"),
    fileInput: document.getElementById("fileInput"),
    removeImageBtn: document.getElementById("removeImageBtn"),
    pinImage: document.getElementById("pinImage"),
    pinPlaceholder: document.getElementById("pinPlaceholder"),

    // Image adjustments
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

    // Customize accordion
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
    downloadBtn: document.getElementById("downloadBtn"),
    pinCard: document.getElementById("pinCard"),
    exportGhost: document.getElementById("exportGhost"),
  };

  /* ==========================================================================
     STATE
     ========================================================================== */

  const state = {
    imageSrc: null,

    zoom: CONFIG.image.zoomDefault,
    posX: CONFIG.image.positionDefault,
    posY: CONFIG.image.positionDefault,

    headline: "",
    subheadline: "",

    style: "bottom",

    font: "league-spartan",
    color: "#ffffff",

    ctaType: "SHOP ON ETSY",
    customCta: "",

    isCustomizingOpen: false,
    isExporting: false,
  };

  /* ==========================================================================
     IMAGE TRANSFORM
     ========================================================================== */

  function applyImageTransform() {
    if (!dom.pinImage) return;

    const scale = state.zoom / 100;

    dom.pinImage.style.transform = `scale(${scale})`;
    dom.pinImage.style.transformOrigin = "center center";

    dom.pinImage.style.objectPosition =
      `${state.posX}% ${state.posY}%`;
  }

  function updateImageControls() {
    if (dom.zoomSlider) {
      dom.zoomSlider.value = state.zoom;
    }

    if (dom.zoomValue) {
      dom.zoomValue.textContent = `${state.zoom}%`;
    }

    if (dom.posXSlider) {
      dom.posXSlider.value = state.posX;
    }

    if (dom.posYSlider) {
      dom.posYSlider.value = state.posY;
    }

    applyImageTransform();
  }

  function resetImagePosition() {
    state.zoom = CONFIG.image.zoomDefault;
    state.posX = CONFIG.image.positionDefault;
    state.posY = CONFIG.image.positionDefault;

    updateImageControls();
  }

  /* ==========================================================================
     UPLOAD
     ========================================================================== */

  function handleFile(file) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a PNG or JPG image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be smaller than 10MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
      state.imageSrc = event.target.result;

      if (dom.pinImage) {
        dom.pinImage.src = state.imageSrc;
        dom.pinImage.classList.remove("hidden");
        dom.pinImage.classList.add("pf-animate-in");
      }

      if (dom.pinPlaceholder) {
        dom.pinPlaceholder.classList.add("hidden");
      }

      if (dom.removeImageBtn) {
        dom.removeImageBtn.classList.remove("hidden");
      }

      // IMPORTANT:
      // Every new image starts from a clean default position.
      resetImagePosition();

      setTimeout(() => {
        if (dom.pinImage) {
          dom.pinImage.classList.remove("pf-animate-in");
        }
      }, 500);
    };

    reader.readAsDataURL(file);
  }

  function setupUpload() {
    if (!dom.dropzone || !dom.fileInput) return;

    dom.fileInput.addEventListener("change", function (event) {
      const file =
        event.target.files &&
        event.target.files[0];

      if (file) {
        handleFile(file);
      }
    });

    ["dragenter", "dragover"].forEach(function (eventName) {
      dom.dropzone.addEventListener(eventName, function (event) {
        event.preventDefault();
        event.stopPropagation();

        dom.dropzone.classList.add("is-dragover");
      });
    });

    ["dragleave", "drop"].forEach(function (eventName) {
      dom.dropzone.addEventListener(eventName, function (event) {
        event.preventDefault();
        event.stopPropagation();

        dom.dropzone.classList.remove("is-dragover");
      });
    });

    dom.dropzone.addEventListener("drop", function (event) {
      const files = event.dataTransfer.files;

      if (files && files[0]) {
        handleFile(files[0]);
      }
    });

    if (dom.removeImageBtn) {
      dom.removeImageBtn.addEventListener("click", function () {
        state.imageSrc = null;

        if (dom.pinImage) {
          dom.pinImage.src = "";
          dom.pinImage.classList.add("hidden");
        }

        if (dom.pinPlaceholder) {
          dom.pinPlaceholder.classList.remove("hidden");
        }

        dom.removeImageBtn.classList.add("hidden");

        if (dom.fileInput) {
          dom.fileInput.value = "";
        }

        resetImagePosition();
      });
    }
  }

  /* ==========================================================================
     IMAGE ADJUSTMENTS
     ========================================================================== */

  function setupImagePosition() {
    if (dom.zoomSlider) {
      dom.zoomSlider.addEventListener("input", function (event) {
        state.zoom = parseInt(event.target.value, 10);

        if (dom.zoomValue) {
          dom.zoomValue.textContent = `${state.zoom}%`;
        }

        applyImageTransform();
      });
    }

    if (dom.posXSlider) {
      dom.posXSlider.addEventListener("input", function (event) {
        state.posX = parseInt(event.target.value, 10);
        applyImageTransform();
      });
    }

    if (dom.posYSlider) {
      dom.posYSlider.addEventListener("input", function (event) {
        state.posY = parseInt(event.target.value, 10);
        applyImageTransform();
      });
    }

    if (dom.resetPositionBtn) {
      dom.resetPositionBtn.addEventListener("click", function () {
        resetImagePosition();
      });
    }
  }

  /* ==========================================================================
     TEXT PREVIEW
     ========================================================================== */

  function setupTextPreview() {
    if (dom.headlineInput && dom.pinHeadline) {
      dom.headlineInput.addEventListener("input", function (event) {
        state.headline = event.target.value;

        dom.pinHeadline.textContent =
          state.headline.trim() ||
          CONFIG.text.headlineFallback;

        if (dom.headlineCount) {
          dom.headlineCount.textContent =
            `${state.headline.length}/60`;
        }
      });
    }

    if (dom.subheadlineInput && dom.pinSubheadline) {
      dom.subheadlineInput.addEventListener("input", function (event) {
        state.subheadline = event.target.value;

        dom.pinSubheadline.textContent =
          state.subheadline.trim() ||
          CONFIG.text.subheadlineFallback;

        if (dom.subheadlineCount) {
          dom.subheadlineCount.textContent =
            `${state.subheadline.length}/80`;
        }
      });
    }
  }

  /* ==========================================================================
     OVERLAY POSITION
     ========================================================================== */

  function updatePillPosition() {
    if (!dom.styleTogglePill || !dom.styleToggle) return;

    const activeButton =
      dom.styleToggle.querySelector(
        `[data-style="${state.style}"]`
      );

    if (!activeButton) return;

    const toggleRect =
      dom.styleToggle.getBoundingClientRect();

    const buttonRect =
      activeButton.getBoundingClientRect();

    dom.styleTogglePill.style.width =
      `${buttonRect.width}px`;

    dom.styleTogglePill.style.transform =
      `translateX(${buttonRect.left - toggleRect.left - 4}px)`;
  }

  function setOverlayStyle(styleKey) {
    if (!STYLE_PRESETS[styleKey]) return;

    state.style = styleKey;

    const preset = STYLE_PRESETS[styleKey];

    if (dom.pinTextWrap) {
      dom.pinTextWrap.className = preset.wrap;
    }

    if (dom.pinScrim) {
      dom.pinScrim.className = preset.scrim;
    }

    if (dom.styleToggle) {
      dom.styleToggle
        .querySelectorAll(".style-btn")
        .forEach(function (button) {
          const isActive =
            button.getAttribute("data-style") === styleKey;

          button.classList.toggle(
            "is-active",
            isActive
          );
        });
    }

    requestAnimationFrame(updatePillPosition);
  }

  function setupStyleToggle() {
    if (!dom.styleToggle) return;

    dom.styleToggle.addEventListener(
      "click",
      function (event) {
        const button =
          event.target.closest(".style-btn");

        if (!button) return;

        const styleKey =
          button.getAttribute("data-style");

        setOverlayStyle(styleKey);
      }
    );

    window.addEventListener(
      "resize",
      updatePillPosition
    );

    setTimeout(updatePillPosition, 100);
  }

  /* ==========================================================================
     CUSTOMIZE DESIGN ACCORDION
     ========================================================================== */

  function setCustomizePanel(open) {
    state.isCustomizingOpen = open;

    if (dom.customizePanel) {
      dom.customizePanel.classList.toggle(
        "is-open",
        open
      );
    }

    if (dom.customizeChevron) {
      dom.customizeChevron.classList.toggle(
        "is-open",
        open
      );
    }

    if (dom.customizeToggleBtn) {
      dom.customizeToggleBtn.setAttribute(
        "aria-expanded",
        open ? "true" : "false"
      );
    }
  }

  function setupDisclosure() {
    if (
      !dom.customizeToggleBtn ||
      !dom.customizePanel
    ) {
      return;
    }

    // Start CLOSED by default.
    setCustomizePanel(false);

    dom.customizeToggleBtn.addEventListener(
      "click",
      function () {
        setCustomizePanel(
          !state.isCustomizingOpen
        );
      }
    );
  }

  /* ==========================================================================
     FONT SELECTOR
     ========================================================================== */

  function setupFontSelector() {
    if (!dom.fontSelector) return;

    dom.fontSelector.addEventListener(
      "click",
      function (event) {
        const chip =
          event.target.closest(".font-chip");

        if (!chip) return;

        const fontKey =
          chip.getAttribute("data-font");

        if (!FONT_FAMILIES[fontKey]) return;

        state.font = fontKey;

        if (dom.pinHeadline) {
          dom.pinHeadline.style.fontFamily =
            FONT_FAMILIES[fontKey];
        }

        dom.fontSelector
          .querySelectorAll(".font-chip")
          .forEach(function (item) {
            item.classList.toggle(
              "is-active",
              item === chip
            );
          });
      }
    );
  }

  /* ==========================================================================
     HEADLINE COLOR
     ========================================================================== */

  function applyHeadlineColor(color) {
    state.color = color;

    if (dom.pinHeadline) {
      dom.pinHeadline.style.color = color;
    }
  }

  function setupColorSelector() {
    if (!dom.colorSelector) return;

    dom.colorSelector.addEventListener(
      "click",
      function (event) {
        const swatch =
          event.target.closest(
            ".color-swatch:not(.color-swatch--custom)"
          );

        if (!swatch) return;

        const color =
          swatch.getAttribute("data-color");

        applyHeadlineColor(color);

        dom.colorSelector
          .querySelectorAll(".color-swatch")
          .forEach(function (item) {
            item.classList.toggle(
              "is-active",
              item === swatch
            );
          });
      }
    );

    if (
      dom.customColorInput &&
      dom.customColorSwatch
    ) {
      dom.customColorInput.addEventListener(
        "input",
        function (event) {
          const color = event.target.value;

          applyHeadlineColor(color);

          dom.colorSelector
            .querySelectorAll(".color-swatch")
            .forEach(function (item) {
              item.classList.toggle(
                "is-active",
                item === dom.customColorSwatch
              );
            });
        }
      );
    }
  }

  /* ==========================================================================
     CTA BADGE
     ========================================================================== */

  function updateCtaDisplay() {
    if (
      !dom.pinCtaWrap ||
      !dom.pinCtaLabel
    ) {
      return;
    }

    if (
      state.ctaType ===
      CONFIG.cta.noneValue
    ) {
      dom.pinCtaWrap.classList.add("hidden");
      return;
    }

    dom.pinCtaWrap.classList.remove("hidden");

    let label = state.ctaType;

    if (
      state.ctaType ===
      CONFIG.cta.customValue
    ) {
      label =
        state.customCta.trim() ||
        "SHOP NOW";
    }

    dom.pinCtaLabel.textContent = label;
  }

  function setupCtaSelector() {
    if (!dom.ctaSelect) return;

    dom.ctaSelect.addEventListener(
      "change",
      function (event) {
        state.ctaType = event.target.value;

        if (dom.ctaCustomInput) {
          dom.ctaCustomInput.classList.toggle(
            "hidden",
            state.ctaType !==
              CONFIG.cta.customValue
          );
        }

        updateCtaDisplay();
      }
    );

    if (dom.ctaCustomInput) {
      dom.ctaCustomInput.addEventListener(
        "input",
        function (event) {
          state.customCta =
            event.target.value;

          updateCtaDisplay();
        }
      );
    }
  }

  /* ==========================================================================
     EXPORT — EXACT 1000 × 1500 PNG
     ========================================================================== */

  async function exportPin() {
    if (
      state.isExporting ||
      !dom.pinCard ||
      !dom.exportGhost
    ) {
      return;
    }

    state.isExporting = true;

    if (dom.downloadBtn) {
      dom.downloadBtn.disabled = true;
      dom.downloadBtn.classList.add("opacity-90");

      dom.downloadBtn.innerHTML =
        `${ICONS.spinner}<span>Generating 1000×1500 Pin...</span>`;
    }

    try {
      // Wait for fonts before rendering.
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      // Clone visible pin.
      const clone =
        dom.pinCard.cloneNode(true);

      clone.style.width =
        `${CONFIG.export.width}px`;

      clone.style.height =
        `${CONFIG.export.height}px`;

      clone.style.minWidth =
        `${CONFIG.export.width}px`;

      clone.style.maxWidth =
        `${CONFIG.export.width}px`;

      clone.style.transform = "none";
      clone.style.borderRadius = "0";
      clone.style.boxShadow = "none";
      clone.style.margin = "0";

      /* --------------------------------------------------------------------
         Make sure image transform is carried into exported clone
         -------------------------------------------------------------------- */

      const cloneImage =
        clone.querySelector("#pinImage");

      if (cloneImage) {
        cloneImage.style.transform =
          `scale(${state.zoom / 100})`;

        cloneImage.style.transformOrigin =
          "center center";

        cloneImage.style.objectPosition =
          `${state.posX}% ${state.posY}%`;
      }

      /* --------------------------------------------------------------------
         Export typography
         -------------------------------------------------------------------- */

      const cloneHeadline =
        clone.querySelector("#pinHeadline");

      if (cloneHeadline) {
        cloneHeadline.style.fontSize =
          `${CONFIG.export.width *
          CONFIG.export.headlineFontRatio}px`;

        cloneHeadline.style.fontFamily =
          FONT_FAMILIES[state.font];

        cloneHeadline.style.color =
          state.color;
      }

      const cloneSubheadline =
        clone.querySelector(
          "#pinSubheadline"
        );

      if (cloneSubheadline) {
        cloneSubheadline.style.fontSize =
          `${CONFIG.export.width *
          CONFIG.export.subheadlineFontRatio}px`;
      }

      /* --------------------------------------------------------------------
         Place clone offscreen
         -------------------------------------------------------------------- */

      dom.exportGhost.innerHTML = "";

      dom.exportGhost.style.width =
        `${CONFIG.export.width}px`;

      dom.exportGhost.style.height =
        `${CONFIG.export.height}px`;

      dom.exportGhost.appendChild(clone);

      /* --------------------------------------------------------------------
         IMPORTANT:
         scale = 1 means final canvas is EXACTLY 1000 × 1500.
         -------------------------------------------------------------------- */

      const canvas =
        await html2canvas(clone, {
          width: CONFIG.export.width,
          height: CONFIG.export.height,
          scale: 1,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          logging: false,
        });

      /* --------------------------------------------------------------------
         Download
         -------------------------------------------------------------------- */

      const link =
        document.createElement("a");

      let filename =
        state.headline.trim() ||
        "pinforge-pin";

      filename = filename
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      link.download =
        `${filename}-1000x1500.png`;

      link.href =
        canvas.toDataURL("image/png");

      document.body.appendChild(link);
      link.click();
      link.remove();

      dom.exportGhost.innerHTML = "";

      /* --------------------------------------------------------------------
         Success feedback
         -------------------------------------------------------------------- */

      if (dom.downloadBtn) {
        dom.downloadBtn.classList.add(
          "pf-success"
        );

        dom.downloadBtn.innerHTML =
          `${ICONS.check}<span>Pin Downloaded!</span>`;
      }

      setTimeout(function () {
        if (dom.downloadBtn) {
          dom.downloadBtn.disabled = false;

          dom.downloadBtn.classList.remove(
            "opacity-90",
            "pf-success"
          );

          dom.downloadBtn.innerHTML =
            `${ICONS.download}<span>Download PNG</span>`;
        }

        state.isExporting = false;
      }, CONFIG.successMessageDurationMs);

    } catch (error) {
      console.error(
        "PinForge export error:",
        error
      );

      dom.exportGhost.innerHTML = "";

      if (dom.downloadBtn) {
        dom.downloadBtn.disabled = false;

        dom.downloadBtn.classList.remove(
          "opacity-90"
        );

        dom.downloadBtn.innerHTML =
          `${ICONS.download}<span>Export Failed — Retry</span>`;
      }

      state.isExporting = false;
    }
  }

  function setupExporter() {
    if (!dom.downloadBtn) return;

    dom.downloadBtn.addEventListener(
      "click",
      exportPin
    );
  }

  /* ==========================================================================
     HEADER EFFECT
     ========================================================================== */

  function setupChromeEffects() {
    if (!dom.siteHeader) return;

    window.addEventListener(
      "scroll",
      function () {
        dom.siteHeader.classList.toggle(
          "is-scrolled",
          window.scrollY >
            CONFIG.headerScrollThresholdPx
        );
      },
      { passive: true }
    );
  }

  /* ==========================================================================
     INITIAL STATE
     ========================================================================== */

  function setInitialState() {
    // Image
    resetImagePosition();

    // Bottom overlay
    setOverlayStyle("bottom");

    // League Spartan
    state.font = "league-spartan";

    if (dom.pinHeadline) {
      dom.pinHeadline.style.fontFamily =
        FONT_FAMILIES["league-spartan"];
    }

    // White headline
    applyHeadlineColor("#ffffff");

    // Default CTA
    state.ctaType = "SHOP ON ETSY";

    if (dom.ctaSelect) {
      dom.ctaSelect.value =
        "SHOP ON ETSY";
    }

    updateCtaDisplay();

    // Customize Design CLOSED
    setCustomizePanel(false);

    // Counters
    if (dom.headlineCount) {
      dom.headlineCount.textContent = "0/60";
    }

    if (dom.subheadlineCount) {
      dom.subheadlineCount.textContent = "0/80";
    }

    setTimeout(
      updatePillPosition,
      100
    );
  }

  /* ==========================================================================
     INIT
     ========================================================================== */

  function init() {
    setupUpload();
    setupImagePosition();
    setupTextPreview();
    setupStyleToggle();
    setupDisclosure();
    setupFontSelector();
    setupColorSelector();
    setupCtaSelector();
    setupExporter();
    setupChromeEffects();

    setInitialState();

    console.log(
      "PinForge v0.2 initialized ✨"
    );
  }

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init
    );
  } else {
    init();
  }
})();