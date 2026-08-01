/* ==========================================================================
   PinForge v0.2.2 — app.js
   Mobile Preview + Image Position Fix + Safari Export Fix
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

      // How far X/Y sliders can visually move the image.
      // Kept moderate so the image does not fly outside the card.
      translateStrength: 0.30,
    },

    cta: {
      customValue: "custom",
      noneValue: "none",
    },

    successMessageDurationMs: 1800,
    headerScrollThresholdPx: 8,

    mobile: {
      breakpoint: 1024,
      stickyTriggerOffset: 110,
    },
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

  function getImageTransform() {
    const scale = state.zoom / 100;

    const moveX =
      (state.posX - 50) *
      CONFIG.image.translateStrength;

    const moveY =
      (state.posY - 50) *
      CONFIG.image.translateStrength;

    return {
      scale,
      moveX,
      moveY,
      transform:
        `translate(${moveX}%, ${moveY}%) scale(${scale})`,
    };
  }

  function applyImageTransform() {
    if (!dom.pinImage) return;

    const transform = getImageTransform();

    /*
      IMPORTANT:
      We use BOTH object-position and translate.

      object-position changes the crop focal point.
      translate guarantees the movement is visually noticeable,
      especially for vertical Position Y on mobile Safari.
    */

    dom.pinImage.style.objectPosition =
      `${state.posX}% ${state.posY}%`;

    dom.pinImage.style.transform =
      transform.transform;

    dom.pinImage.style.transformOrigin =
      "center center";
  }

  function updateImageControls() {
    if (dom.zoomSlider) {
      dom.zoomSlider.value = state.zoom;
    }

    if (dom.zoomValue) {
      dom.zoomValue.textContent =
        `${state.zoom}%`;
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
    state.zoom =
      CONFIG.image.zoomDefault;

    state.posX =
      CONFIG.image.positionDefault;

    state.posY =
      CONFIG.image.positionDefault;

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
        dom.pinImage.src =
          state.imageSrc;

        dom.pinImage.classList.remove(
          "hidden"
        );

        dom.pinImage.classList.add(
          "pf-animate-in"
        );
      }

      if (dom.pinPlaceholder) {
        dom.pinPlaceholder.classList.add(
          "hidden"
        );
      }

      if (dom.removeImageBtn) {
        dom.removeImageBtn.classList.remove(
          "hidden"
        );
      }

      /*
        Every new image starts at:
        Zoom 100
        X 50
        Y 50
      */

      resetImagePosition();

      setTimeout(function () {
        dom.pinImage?.classList.remove(
          "pf-animate-in"
        );
      }, 500);
    };

    reader.readAsDataURL(file);
  }

  function setupUpload() {
    if (!dom.dropzone || !dom.fileInput) {
      return;
    }

    dom.fileInput.addEventListener(
      "change",
      function (event) {
        const file =
          event.target.files?.[0];

        if (file) {
          handleFile(file);
        }
      }
    );

    ["dragenter", "dragover"].forEach(
      function (eventName) {
        dom.dropzone.addEventListener(
          eventName,
          function (event) {
            event.preventDefault();
            event.stopPropagation();

            dom.dropzone.classList.add(
              "is-dragover"
            );
          }
        );
      }
    );

    ["dragleave", "drop"].forEach(
      function (eventName) {
        dom.dropzone.addEventListener(
          eventName,
          function (event) {
            event.preventDefault();
            event.stopPropagation();

            dom.dropzone.classList.remove(
              "is-dragover"
            );
          }
        );
      }
    );

    dom.dropzone.addEventListener(
      "drop",
      function (event) {
        const files =
          event.dataTransfer?.files;

        if (files?.[0]) {
          handleFile(files[0]);
        }
      }
    );

    dom.removeImageBtn?.addEventListener(
      "click",
      function () {
        state.imageSrc = null;

        if (dom.pinImage) {
          dom.pinImage.src = "";
          dom.pinImage.classList.add(
            "hidden"
          );
        }

        dom.pinPlaceholder?.classList.remove(
          "hidden"
        );

        dom.removeImageBtn.classList.add(
          "hidden"
        );

        dom.fileInput.value = "";

        resetImagePosition();
      }
    );
  }

  /* ==========================================================================
     IMAGE ADJUSTMENTS
     ========================================================================== */

  function setupImagePosition() {
    dom.zoomSlider?.addEventListener(
      "input",
      function (event) {
        state.zoom =
          Number(event.target.value);

        if (dom.zoomValue) {
          dom.zoomValue.textContent =
            `${state.zoom}%`;
        }

        applyImageTransform();
      }
    );

    dom.posXSlider?.addEventListener(
      "input",
      function (event) {
        state.posX =
          Number(event.target.value);

        applyImageTransform();
      }
    );

    dom.posYSlider?.addEventListener(
      "input",
      function (event) {
        state.posY =
          Number(event.target.value);

        applyImageTransform();
      }
    );

    dom.resetPositionBtn?.addEventListener(
      "click",
      resetImagePosition
    );
  }

  /* ==========================================================================
     TEXT PREVIEW
     ========================================================================== */

  function setupTextPreview() {
    dom.headlineInput?.addEventListener(
      "input",
      function (event) {
        state.headline =
          event.target.value;

        if (dom.pinHeadline) {
          dom.pinHeadline.textContent =
            state.headline.trim() ||
            CONFIG.text.headlineFallback;
        }

        if (dom.headlineCount) {
          dom.headlineCount.textContent =
            `${state.headline.length}/60`;
        }
      }
    );

    dom.subheadlineInput?.addEventListener(
      "input",
      function (event) {
        state.subheadline =
          event.target.value;

        if (dom.pinSubheadline) {
          dom.pinSubheadline.textContent =
            state.subheadline.trim() ||
            CONFIG.text.subheadlineFallback;
        }

        if (dom.subheadlineCount) {
          dom.subheadlineCount.textContent =
            `${state.subheadline.length}/80`;
        }
      }
    );
  }

  /* ==========================================================================
     OVERLAY POSITION
     ========================================================================== */

  function updatePillPosition() {
    if (
      !dom.styleTogglePill ||
      !dom.styleToggle
    ) {
      return;
    }

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
      `translateX(${
        buttonRect.left -
        toggleRect.left -
        4
      }px)`;
  }

  function setOverlayStyle(styleKey) {
    if (!STYLE_PRESETS[styleKey]) return;

    state.style = styleKey;

    const preset =
      STYLE_PRESETS[styleKey];

    if (dom.pinTextWrap) {
      dom.pinTextWrap.className =
        preset.wrap;
    }

    if (dom.pinScrim) {
      dom.pinScrim.className =
        preset.scrim;
    }

    dom.styleToggle
      ?.querySelectorAll(".style-btn")
      .forEach(function (button) {
        button.classList.toggle(
          "is-active",
          button.dataset.style ===
            styleKey
        );
      });

    requestAnimationFrame(
      updatePillPosition
    );
  }

  function setupStyleToggle() {
    if (!dom.styleToggle) return;

    dom.styleToggle.addEventListener(
      "click",
      function (event) {
        const button =
          event.target.closest(
            ".style-btn"
          );

        if (!button) return;

        setOverlayStyle(
          button.dataset.style
        );
      }
    );

    window.addEventListener(
      "resize",
      updatePillPosition
    );
  }

  /* ==========================================================================
     CUSTOMIZE DESIGN
     ========================================================================== */

  function setCustomizePanel(open) {
    state.isCustomizingOpen = open;

    dom.customizePanel?.classList.toggle(
      "is-open",
      open
    );

    dom.customizeChevron?.classList.toggle(
      "is-open",
      open
    );

    dom.customizeToggleBtn?.setAttribute(
      "aria-expanded",
      open ? "true" : "false"
    );
  }

  function setupDisclosure() {
    setCustomizePanel(false);

    dom.customizeToggleBtn?.addEventListener(
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
    dom.fontSelector?.addEventListener(
      "click",
      function (event) {
        const chip =
          event.target.closest(
            ".font-chip"
          );

        if (!chip) return;

        const fontKey =
          chip.dataset.font;

        if (!FONT_FAMILIES[fontKey]) {
          return;
        }

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
      dom.pinHeadline.style.color =
        color;
    }
  }

  function setupColorSelector() {
    dom.colorSelector?.addEventListener(
      "click",
      function (event) {
        const swatch =
          event.target.closest(
            ".color-swatch:not(.color-swatch--custom)"
          );

        if (!swatch) return;

        applyHeadlineColor(
          swatch.dataset.color
        );

        dom.colorSelector
          .querySelectorAll(
            ".color-swatch"
          )
          .forEach(function (item) {
            item.classList.toggle(
              "is-active",
              item === swatch
            );
          });
      }
    );

    dom.customColorInput?.addEventListener(
      "input",
      function (event) {
        applyHeadlineColor(
          event.target.value
        );

        dom.colorSelector
          ?.querySelectorAll(
            ".color-swatch"
          )
          .forEach(function (item) {
            item.classList.toggle(
              "is-active",
              item ===
                dom.customColorSwatch
            );
          });
      }
    );
  }

  /* ==========================================================================
     CTA
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
      dom.pinCtaWrap.classList.add(
        "hidden"
      );
      return;
    }

    dom.pinCtaWrap.classList.remove(
      "hidden"
    );

    let label = state.ctaType;

    if (
      state.ctaType ===
      CONFIG.cta.customValue
    ) {
      label =
        state.customCta.trim() ||
        "SHOP NOW";
    }

    dom.pinCtaLabel.textContent =
      label;
  }

  function setupCtaSelector() {
    dom.ctaSelect?.addEventListener(
      "change",
      function (event) {
        state.ctaType =
          event.target.value;

        dom.ctaCustomInput?.classList.toggle(
          "hidden",
          state.ctaType !==
            CONFIG.cta.customValue
        );

        updateCtaDisplay();
      }
    );

    dom.ctaCustomInput?.addEventListener(
      "input",
      function (event) {
        state.customCta =
          event.target.value;

        updateCtaDisplay();
      }
    );
  }

  /* ==========================================================================
     MOBILE LIVE PREVIEW
     ========================================================================== */

  function setupMobilePreview() {
    if (!dom.pinCard) return;

    /*
      We add the compact class ONLY after the user has
      scrolled past the normal preview.

      So:
      - Page first loads = beautiful large preview.
      - User scrolls down to edit = small sticky preview.
      - User goes back up = normal preview again.
    */

    let originalCardTop = 0;

    function calculatePosition() {
      if (
        window.innerWidth >=
        CONFIG.mobile.breakpoint
      ) {
        dom.pinCard.classList.remove(
          "pf-mobile-live-preview"
        );
        return;
      }

      if (
        !dom.pinCard.classList.contains(
          "pf-mobile-live-preview"
        )
      ) {
        originalCardTop =
          dom.pinCard.getBoundingClientRect().top +
          window.scrollY;
      }

      const shouldCompact =
        window.scrollY >
        originalCardTop +
          dom.pinCard.offsetHeight -
          CONFIG.mobile.stickyTriggerOffset;

      dom.pinCard.classList.toggle(
        "pf-mobile-live-preview",
        shouldCompact
      );
    }

    setTimeout(function () {
      originalCardTop =
        dom.pinCard.getBoundingClientRect().top +
        window.scrollY;

      calculatePosition();
    }, 200);

    window.addEventListener(
      "scroll",
      calculatePosition,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      function () {
        dom.pinCard.classList.remove(
          "pf-mobile-live-preview"
        );

        setTimeout(function () {
          originalCardTop =
            dom.pinCard.getBoundingClientRect().top +
            window.scrollY;

          calculatePosition();
        }, 100);
      },
      { passive: true }
    );
  }

  /* ==========================================================================
     EXPORT — EXACT 1000 × 1500
     ========================================================================== */

  function isIOSDevice() {
    return (
      /iPad|iPhone|iPod/.test(
        navigator.userAgent
      ) ||
      (
        navigator.platform ===
          "MacIntel" &&
        navigator.maxTouchPoints > 1
      )
    );
  }

  function makeFilename() {
    let filename =
      state.headline.trim() ||
      "pinforge-pin";

    filename = filename
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return (
      `${filename}-1000x1500.png`
    );
  }

  function canvasToBlob(canvas) {
    return new Promise(function (
      resolve,
      reject
    ) {
      canvas.toBlob(
        function (blob) {
          if (blob) {
            resolve(blob);
          } else {
            reject(
              new Error(
                "Could not create PNG."
              )
            );
          }
        },
        "image/png",
        1
      );
    });
  }

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

      dom.downloadBtn.innerHTML =
        `${ICONS.spinner}<span>Generating 1000×1500 Pin...</span>`;
    }

    try {
      if (
        document.fonts &&
        document.fonts.ready
      ) {
        await document.fonts.ready;
      }

      const clone =
        dom.pinCard.cloneNode(true);

      clone.classList.remove(
        "pf-mobile-live-preview"
      );

      clone.style.width =
        `${CONFIG.export.width}px`;

      clone.style.height =
        `${CONFIG.export.height}px`;

      clone.style.minWidth =
        `${CONFIG.export.width}px`;

      clone.style.maxWidth =
        `${CONFIG.export.width}px`;

      clone.style.position =
        "relative";

      clone.style.inset = "auto";
      clone.style.transform = "none";
      clone.style.borderRadius = "0";
      clone.style.boxShadow = "none";
      clone.style.margin = "0";

      /* IMAGE */

      const cloneImage =
        clone.querySelector(
          "#pinImage"
        );

      if (cloneImage) {
        const imageTransform =
          getImageTransform();

        cloneImage.style.objectPosition =
          `${state.posX}% ${state.posY}%`;

        cloneImage.style.transform =
          imageTransform.transform;

        cloneImage.style.transformOrigin =
          "center center";
      }

      /* HEADLINE */

      const cloneHeadline =
        clone.querySelector(
          "#pinHeadline"
        );

      if (cloneHeadline) {
        cloneHeadline.style.fontSize =
          `${
            CONFIG.export.width *
            CONFIG.export.headlineFontRatio
          }px`;

        cloneHeadline.style.fontFamily =
          FONT_FAMILIES[state.font];

        cloneHeadline.style.color =
          state.color;
      }

      /* SUBHEADLINE */

      const cloneSubheadline =
        clone.querySelector(
          "#pinSubheadline"
        );

      if (cloneSubheadline) {
        cloneSubheadline.style.fontSize =
          `${
            CONFIG.export.width *
            CONFIG.export.subheadlineFontRatio
          }px`;
      }

      /* GHOST */

      dom.exportGhost.innerHTML = "";

      dom.exportGhost.style.width =
        `${CONFIG.export.width}px`;

      dom.exportGhost.style.height =
        `${CONFIG.export.height}px`;

      dom.exportGhost.appendChild(
        clone
      );

      if (
        typeof html2canvas ===
        "undefined"
      ) {
        throw new Error(
          "html2canvas is not loaded."
        );
      }

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

      dom.exportGhost.innerHTML = "";

      const filename =
        makeFilename();

      const blob =
        await canvasToBlob(canvas);

      const blobUrl =
        URL.createObjectURL(blob);

      /* --------------------------------------------------------
         iPHONE / iPAD
         --------------------------------------------------------

         Safari often ignores <a download>.
         So instead we open the PNG itself.

         User can then:
         Share → Save Image
         OR
         Share → Save to Files
      -------------------------------------------------------- */

      if (isIOSDevice()) {
        const opened =
          window.open(
            blobUrl,
            "_blank"
          );

        if (!opened) {
          window.location.href =
            blobUrl;
        }

        // Keep URL alive longer because Safari needs it.
        setTimeout(function () {
          URL.revokeObjectURL(blobUrl);
        }, 60000);
      }

      /* --------------------------------------------------------
         DESKTOP / ANDROID / NORMAL BROWSERS
      -------------------------------------------------------- */

      else {
        const link =
          document.createElement("a");

        link.href = blobUrl;
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(function () {
          URL.revokeObjectURL(blobUrl);
        }, 5000);
      }

      if (dom.downloadBtn) {
        dom.downloadBtn.classList.add(
          "pf-success"
        );

        dom.downloadBtn.innerHTML =
          `${ICONS.check}<span>Pin Ready!</span>`;
      }

      setTimeout(function () {
        if (dom.downloadBtn) {
          dom.downloadBtn.disabled =
            false;

          dom.downloadBtn.classList.remove(
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
        dom.downloadBtn.disabled =
          false;

        dom.downloadBtn.innerHTML =
          `${ICONS.download}<span>Export Failed — Retry</span>`;
      }

      state.isExporting = false;
    }
  }

  function setupExporter() {
    dom.downloadBtn?.addEventListener(
      "click",
      exportPin
    );
  }

  /* ==========================================================================
     HEADER
     ========================================================================== */

  function setupChromeEffects() {
    window.addEventListener(
      "scroll",
      function () {
        dom.siteHeader?.classList.toggle(
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
    resetImagePosition();

    setOverlayStyle("bottom");

    state.font =
      "league-spartan";

    if (dom.pinHeadline) {
      dom.pinHeadline.style.fontFamily =
        FONT_FAMILIES[
          "league-spartan"
        ];
    }

    applyHeadlineColor(
      "#ffffff"
    );

    state.ctaType =
      "SHOP ON ETSY";

    if (dom.ctaSelect) {
      dom.ctaSelect.value =
        "SHOP ON ETSY";
    }

    updateCtaDisplay();

    setCustomizePanel(false);

    if (dom.headlineCount) {
      dom.headlineCount.textContent =
        "0/60";
    }

    if (dom.subheadlineCount) {
      dom.subheadlineCount.textContent =
        "0/80";
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
    setupMobilePreview();

    setInitialState();

    console.log(
      "PinForge v0.2.2 initialized ✨"
    );
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init
    );
  } else {
    init();
  }
})();