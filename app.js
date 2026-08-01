/* ==========================================================================
   PinForge v0.2 — app.js
   FULL REPLACEMENT
   Matches current index.html + style.css

   Fixes:
   - Upload image
   - Zoom
   - Position X
   - Position Y
   - Overlay Bottom / Center / Top
   - Headline + Subheadline
   - Font selector
   - Headline color
   - CTA selector + custom CTA
   - Customize accordion
   - Exact 1000 × 1500 export
   - Prevent distorted / stretched export image
   - Preserve CTA text in export
   - Better iOS / Safari export handling
   ========================================================================== */

(function () {
  "use strict";

  /* ==========================================================================
     1. CONFIG
     ========================================================================== */

  const CONFIG = {
    export: {
      width: 1000,
      height: 1500,
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
      defaultValue: "SHOP ON ETSY",
    },

    successMessageDurationMs: 1600,
    headerScrollThresholdPx: 8,
  };


  /* ==========================================================================
     2. OVERLAY PRESETS
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
     3. FONT FAMILIES
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
     4. ICONS
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
     5. DOM CACHE
     ========================================================================== */

  const dom = {
    siteHeader: document.getElementById("siteHeader"),

    /* Upload */
    dropzone: document.getElementById("dropzone"),
    fileInput: document.getElementById("fileInput"),
    removeImageBtn: document.getElementById("removeImageBtn"),

    /* Preview image */
    pinImageWrap: document.getElementById("pinImageWrap"),
    pinImage: document.getElementById("pinImage"),
    pinPlaceholder: document.getElementById("pinPlaceholder"),

    /* Image controls */
    zoomSlider: document.getElementById("zoomSlider"),
    zoomValue: document.getElementById("zoomValue"),
    posXSlider: document.getElementById("posXSlider"),
    posYSlider: document.getElementById("posYSlider"),
    resetPositionBtn: document.getElementById("resetPositionBtn"),

    /* Text */
    headlineInput: document.getElementById("headlineInput"),
    subheadlineInput: document.getElementById("subheadlineInput"),
    headlineCount: document.getElementById("headlineCount"),
    subheadlineCount: document.getElementById("subheadlineCount"),

    pinHeadline: document.getElementById("pinHeadline"),
    pinSubheadline: document.getElementById("pinSubheadline"),

    /* Overlay */
    styleToggle: document.getElementById("styleToggle"),
    styleTogglePill: document.getElementById("styleTogglePill"),
    pinTextWrap: document.getElementById("pinTextWrap"),
    pinScrim: document.getElementById("pinScrim"),

    /* Customize */
    customizeToggleBtn: document.getElementById("customizeToggleBtn"),
    customizePanel: document.getElementById("customizePanel"),
    customizeChevron: document.getElementById("customizeChevron"),

    /* Font */
    fontSelector: document.getElementById("fontSelector"),

    /* Color */
    colorSelector: document.getElementById("colorSelector"),
    customColorSwatch: document.getElementById("customColorSwatch"),
    customColorInput: document.getElementById("customColorInput"),

    /* CTA */
    ctaSelect: document.getElementById("ctaSelect"),
    ctaCustomInput: document.getElementById("ctaCustomInput"),
    pinCtaWrap: document.getElementById("pinCtaWrap"),
    pinCtaLabel: document.getElementById("pinCtaLabel"),

    /* Export */
    downloadBtn: document.getElementById("downloadBtn"),
    pinCard: document.getElementById("pinCard"),
    exportGhost: document.getElementById("exportGhost"),
  };


  /* ==========================================================================
     6. STATE
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

    ctaType: CONFIG.cta.defaultValue,
    customCta: "",

    isCustomizingOpen: false,
    isExporting: false,
  };


  /* ==========================================================================
     7. IMAGE TRANSFORM
     ========================================================================== */

  function applyImageTransform() {
    if (!dom.pinImage) return;

    const scale = state.zoom / 100;

    /*
      IMPORTANT:
      object-position handles X/Y movement.
      transform handles ONLY zoom.

      Do not combine translateX/Y here because that can make
      Position Y behave strangely with object-fit: cover.
    */

    dom.pinImage.style.width = "100%";
    dom.pinImage.style.height = "100%";
    dom.pinImage.style.objectFit = "cover";

    dom.pinImage.style.objectPosition =
      `${state.posX}% ${state.posY}%`;

    dom.pinImage.style.transform =
      `scale(${scale})`;

    dom.pinImage.style.transformOrigin =
      `${state.posX}% ${state.posY}%`;
  }


  function updateImageControls() {
    if (dom.zoomSlider) {
      dom.zoomSlider.value = String(state.zoom);
    }

    if (dom.zoomValue) {
      dom.zoomValue.textContent =
        `${state.zoom}%`;
    }

    if (dom.posXSlider) {
      dom.posXSlider.value =
        String(state.posX);
    }

    if (dom.posYSlider) {
      dom.posYSlider.value =
        String(state.posY);
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
     8. UPLOAD
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
      const result =
        event.target &&
        event.target.result;

      if (!result) return;

      state.imageSrc = result;

      if (dom.pinImage) {
        dom.pinImage.src = result;

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

      resetImagePosition();

      setTimeout(function () {
        if (dom.pinImage) {
          dom.pinImage.classList.remove(
            "pf-animate-in"
          );
        }
      }, 500);
    };

    reader.readAsDataURL(file);
  }


  function clearImage() {
    state.imageSrc = null;

    if (dom.pinImage) {
      dom.pinImage.src = "";
      dom.pinImage.classList.add("hidden");
    }

    if (dom.pinPlaceholder) {
      dom.pinPlaceholder.classList.remove(
        "hidden"
      );
    }

    if (dom.removeImageBtn) {
      dom.removeImageBtn.classList.add(
        "hidden"
      );
    }

    if (dom.fileInput) {
      dom.fileInput.value = "";
    }

    resetImagePosition();
  }


  function setupUpload() {
    if (
      !dom.dropzone ||
      !dom.fileInput
    ) {
      return;
    }

    dom.fileInput.addEventListener(
      "change",
      function (event) {
        const files =
          event.target.files;

        if (files && files[0]) {
          handleFile(files[0]);
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
          event.dataTransfer &&
          event.dataTransfer.files;

        if (files && files[0]) {
          handleFile(files[0]);
        }
      }
    );


    if (dom.removeImageBtn) {
      dom.removeImageBtn.addEventListener(
        "click",
        function (event) {
          event.preventDefault();
          event.stopPropagation();

          clearImage();
        }
      );
    }
  }


  /* ==========================================================================
     9. IMAGE ADJUSTMENTS
     ========================================================================== */

  function setupImagePosition() {
    if (dom.zoomSlider) {
      dom.zoomSlider.addEventListener(
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
    }


    if (dom.posXSlider) {
      dom.posXSlider.addEventListener(
        "input",
        function (event) {
          state.posX =
            Number(event.target.value);

          applyImageTransform();
        }
      );
    }


    if (dom.posYSlider) {
      dom.posYSlider.addEventListener(
        "input",
        function (event) {
          state.posY =
            Number(event.target.value);

          applyImageTransform();
        }
      );
    }


    if (dom.resetPositionBtn) {
      dom.resetPositionBtn.addEventListener(
        "click",
        function () {
          resetImagePosition();
        }
      );
    }
  }


  /* ==========================================================================
     10. TEXT PREVIEW
     ========================================================================== */

  function updateHeadline() {
    if (!dom.pinHeadline) return;

    dom.pinHeadline.textContent =
      state.headline.trim() ||
      CONFIG.text.headlineFallback;
  }


  function updateSubheadline() {
    if (!dom.pinSubheadline) return;

    dom.pinSubheadline.textContent =
      state.subheadline.trim() ||
      CONFIG.text.subheadlineFallback;
  }


  function setupTextPreview() {
    if (dom.headlineInput) {
      dom.headlineInput.addEventListener(
        "input",
        function (event) {
          state.headline =
            event.target.value;

          updateHeadline();

          if (dom.headlineCount) {
            dom.headlineCount.textContent =
              `${state.headline.length}/60`;
          }
        }
      );
    }


    if (dom.subheadlineInput) {
      dom.subheadlineInput.addEventListener(
        "input",
        function (event) {
          state.subheadline =
            event.target.value;

          updateSubheadline();

          if (dom.subheadlineCount) {
            dom.subheadlineCount.textContent =
              `${state.subheadline.length}/80`;
          }
        }
      );
    }
  }


  /* ==========================================================================
     11. OVERLAY POSITION
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
    if (!STYLE_PRESETS[styleKey]) {
      return;
    }

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

    if (dom.styleToggle) {
      dom.styleToggle
        .querySelectorAll(".style-btn")
        .forEach(function (button) {
          button.classList.toggle(
            "is-active",
            button.getAttribute(
              "data-style"
            ) === styleKey
          );
        });
    }

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

        const styleKey =
          button.getAttribute(
            "data-style"
          );

        setOverlayStyle(styleKey);
      }
    );


    window.addEventListener(
      "resize",
      function () {
        requestAnimationFrame(
          updatePillPosition
        );
      },
      { passive: true }
    );
  }


  /* ==========================================================================
     12. CUSTOMIZE ACCORDION
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
     13. FONT SELECTOR
     ========================================================================== */

  function applyFont(fontKey) {
    if (!FONT_FAMILIES[fontKey]) {
      return;
    }

    state.font = fontKey;

    if (dom.pinHeadline) {
      dom.pinHeadline.style.fontFamily =
        FONT_FAMILIES[fontKey];
    }
  }


  function setupFontSelector() {
    if (!dom.fontSelector) return;

    dom.fontSelector.addEventListener(
      "click",
      function (event) {
        const chip =
          event.target.closest(
            ".font-chip"
          );

        if (!chip) return;

        const fontKey =
          chip.getAttribute(
            "data-font"
          );

        if (!FONT_FAMILIES[fontKey]) {
          return;
        }

        applyFont(fontKey);

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
     14. HEADLINE COLOR
     ========================================================================== */

  function applyHeadlineColor(color) {
    if (!color) return;

    state.color = color;

    if (dom.pinHeadline) {
      dom.pinHeadline.style.color =
        color;
    }
  }


  function updateActiveColorSwatch(
    activeSwatch
  ) {
    if (!dom.colorSelector) return;

    dom.colorSelector
      .querySelectorAll(".color-swatch")
      .forEach(function (item) {
        item.classList.toggle(
          "is-active",
          item === activeSwatch
        );
      });
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
          swatch.getAttribute(
            "data-color"
          );

        if (!color) return;

        applyHeadlineColor(color);
        updateActiveColorSwatch(swatch);
      }
    );


    if (
      dom.customColorInput &&
      dom.customColorSwatch
    ) {
      dom.customColorInput.addEventListener(
        "input",
        function (event) {
          const color =
            event.target.value;

          applyHeadlineColor(color);

          updateActiveColorSwatch(
            dom.customColorSwatch
          );
        }
      );
    }
  }


  /* ==========================================================================
     15. CTA
     ========================================================================== */

  function getCurrentCtaText() {
    if (
      state.ctaType ===
      CONFIG.cta.noneValue
    ) {
      return "";
    }

    if (
      state.ctaType ===
      CONFIG.cta.customValue
    ) {
      return (
        state.customCta.trim() ||
        "SHOP NOW"
      );
    }

    return state.ctaType;
  }


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

    dom.pinCtaLabel.textContent =
      getCurrentCtaText();
  }


  function setupCtaSelector() {
    if (!dom.ctaSelect) return;

    dom.ctaSelect.addEventListener(
      "change",
      function (event) {
        state.ctaType =
          event.target.value;

        if (dom.ctaCustomInput) {
          const showCustom =
            state.ctaType ===
            CONFIG.cta.customValue;

          dom.ctaCustomInput.classList.toggle(
            "hidden",
            !showCustom
          );

          if (showCustom) {
            dom.ctaCustomInput.focus();
          }
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
     16. EXPORT HELPERS
     ========================================================================== */

  function waitForNextPaint() {
    return new Promise(function (resolve) {
      requestAnimationFrame(function () {
        requestAnimationFrame(resolve);
      });
    });
  }


  function generateFilename() {
    let filename =
      state.headline.trim() ||
      "pinforge-pin";

    filename = filename
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 50);

    if (!filename) {
      filename = "pinforge-pin";
    }

    return (
      `${filename}-1000x1500.png`
    );
  }


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


  /* ==========================================================================
     17. BUILD EXPORT CLONE
     ========================================================================== */

  function buildExportClone() {
    const clone =
      dom.pinCard.cloneNode(true);

    clone.id = "pinCardExport";

    /*
      ROOT
    */

    clone.style.setProperty(
      "position",
      "relative",
      "important"
    );

    clone.style.setProperty(
      "width",
      "1000px",
      "important"
    );

    clone.style.setProperty(
      "height",
      "1500px",
      "important"
    );

    clone.style.setProperty(
      "min-width",
      "1000px",
      "important"
    );

    clone.style.setProperty(
      "max-width",
      "1000px",
      "important"
    );

    clone.style.setProperty(
      "min-height",
      "1500px",
      "important"
    );

    clone.style.setProperty(
      "max-height",
      "1500px",
      "important"
    );

    clone.style.setProperty(
      "aspect-ratio",
      "auto",
      "important"
    );

    clone.style.setProperty(
      "overflow",
      "hidden",
      "important"
    );

    clone.style.setProperty(
      "border-radius",
      "0",
      "important"
    );

    clone.style.setProperty(
      "box-shadow",
      "none",
      "important"
    );

    clone.style.setProperty(
      "transform",
      "none",
      "important"
    );

    clone.style.setProperty(
      "transition",
      "none",
      "important"
    );

    clone.style.setProperty(
      "margin",
      "0",
      "important"
    );


    /* ======================================================================
       IMAGE WRAPPER
       ====================================================================== */

    const imageWrap =
      clone.querySelector(
        "#pinImageWrap"
      );

    if (imageWrap) {
      imageWrap.style.setProperty(
        "position",
        "absolute",
        "important"
      );

      imageWrap.style.setProperty(
        "inset",
        "0",
        "important"
      );

      imageWrap.style.setProperty(
        "width",
        "1000px",
        "important"
      );

      imageWrap.style.setProperty(
        "height",
        "1500px",
        "important"
      );

      imageWrap.style.setProperty(
        "overflow",
        "hidden",
        "important"
      );
    }


    /* ======================================================================
       IMAGE
       ====================================================================== */

    const image =
      clone.querySelector(
        "#pinImage"
      );

    if (image && state.imageSrc) {
      image.src = state.imageSrc;

      image.classList.remove("hidden");

      image.style.setProperty(
        "display",
        "block",
        "important"
      );

      image.style.setProperty(
        "position",
        "absolute",
        "important"
      );

      image.style.setProperty(
        "top",
        "0",
        "important"
      );

      image.style.setProperty(
        "left",
        "0",
        "important"
      );

      image.style.setProperty(
        "width",
        "100%",
        "important"
      );

      image.style.setProperty(
        "height",
        "100%",
        "important"
      );

      /*
        THE IMPORTANT PART:

        object-fit cover = NEVER stretch image.
      */

      image.style.setProperty(
        "object-fit",
        "cover",
        "important"
      );

      image.style.setProperty(
        "object-position",
        `${state.posX}% ${state.posY}%`,
        "important"
      );

      image.style.setProperty(
        "transform",
        `scale(${state.zoom / 100})`,
        "important"
      );

      image.style.setProperty(
        "transform-origin",
        `${state.posX}% ${state.posY}%`,
        "important"
      );

      image.style.setProperty(
        "max-width",
        "none",
        "important"
      );

      image.style.setProperty(
        "max-height",
        "none",
        "important"
      );

      image.style.setProperty(
        "transition",
        "none",
        "important"
      );
    }


    /* ======================================================================
       PLACEHOLDER
       ====================================================================== */

    const placeholder =
      clone.querySelector(
        "#pinPlaceholder"
      );

    if (
      placeholder &&
      state.imageSrc
    ) {
      placeholder.style.display =
        "none";
    }


    /* ======================================================================
       SCRIM
       ====================================================================== */

    const scrim =
      clone.querySelector(
        "#pinScrim"
      );

    if (scrim) {
      scrim.className = "";

      scrim.style.position =
        "absolute";

      scrim.style.left = "0";
      scrim.style.right = "0";

      scrim.style.pointerEvents =
        "none";

      scrim.style.zIndex = "5";


      if (state.style === "bottom") {
        scrim.style.top = "auto";
        scrim.style.bottom = "0";
        scrim.style.height = "50%";

        scrim.style.background =
          "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.38) 48%, rgba(0,0,0,0) 100%)";
      }


      if (state.style === "top") {
        scrim.style.top = "0";
        scrim.style.bottom = "auto";
        scrim.style.height = "50%";

        scrim.style.background =
          "linear-gradient(to bottom, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.38) 48%, rgba(0,0,0,0) 100%)";
      }


      if (state.style === "center") {
        scrim.style.top = "0";
        scrim.style.bottom = "0";
        scrim.style.height = "100%";

        scrim.style.background =
          "rgba(0,0,0,0.35)";
      }
    }


    /* ======================================================================
       TEXT WRAPPER
       ====================================================================== */

    const textWrap =
      clone.querySelector(
        "#pinTextWrap"
      );

    if (textWrap) {
      textWrap.className = "";

      textWrap.style.position =
        "absolute";

      textWrap.style.left = "0";
      textWrap.style.right = "0";

      textWrap.style.zIndex = "10";

      textWrap.style.padding =
        "60px";

      textWrap.style.display =
        "flex";

      textWrap.style.flexDirection =
        "column";

      textWrap.style.gap =
        "16px";


      if (state.style === "bottom") {
        textWrap.style.top = "auto";
        textWrap.style.bottom = "0";

        textWrap.style.alignItems =
          "flex-start";

        textWrap.style.textAlign =
          "left";

        textWrap.style.transform =
          "none";
      }


      if (state.style === "top") {
        textWrap.style.top = "0";
        textWrap.style.bottom = "auto";

        textWrap.style.alignItems =
          "flex-start";

        textWrap.style.textAlign =
          "left";

        textWrap.style.transform =
          "none";
      }


      if (state.style === "center") {
        textWrap.style.top = "50%";
        textWrap.style.bottom =
          "auto";

        textWrap.style.alignItems =
          "center";

        textWrap.style.textAlign =
          "center";

        textWrap.style.transform =
          "translateY(-50%)";
      }
    }


    /* ======================================================================
       HEADLINE
       ====================================================================== */

    const headline =
      clone.querySelector(
        "#pinHeadline"
      );

    if (headline) {
      headline.textContent =
        state.headline.trim() ||
        CONFIG.text.headlineFallback;

      headline.className = "";

      headline.style.display =
        "block";

      headline.style.width =
        "100%";

      headline.style.margin =
        "0";

      headline.style.padding =
        "0";

      headline.style.fontFamily =
        FONT_FAMILIES[state.font] ||
        FONT_FAMILIES[
          "league-spartan"
        ];

      headline.style.fontSize =
        "72px";

      headline.style.fontWeight =
        "700";

      headline.style.lineHeight =
        "1.08";

      headline.style.letterSpacing =
        "-0.02em";

      headline.style.color =
        state.color ||
        "#ffffff";

      headline.style.overflowWrap =
        "break-word";

      headline.style.wordBreak =
        "normal";
    }


    /* ======================================================================
       SUBHEADLINE
       ====================================================================== */

    const subheadline =
      clone.querySelector(
        "#pinSubheadline"
      );

    if (subheadline) {
      subheadline.textContent =
        state.subheadline.trim() ||
        CONFIG.text.subheadlineFallback;

      subheadline.className = "";

      subheadline.style.display =
        "block";

      subheadline.style.width =
        "100%";

      subheadline.style.margin =
        "0";

      subheadline.style.padding =
        "0";

      subheadline.style.fontFamily =
        "'Inter', sans-serif";

      subheadline.style.fontSize =
        "34px";

      subheadline.style.fontWeight =
        "500";

      subheadline.style.lineHeight =
        "1.3";

      subheadline.style.color =
        "rgba(255,255,255,0.88)";
    }


    /* ======================================================================
       CTA
       ====================================================================== */

    const ctaWrap =
      clone.querySelector(
        "#pinCtaWrap"
      );

    const ctaLabel =
      clone.querySelector(
        "#pinCtaLabel"
      );

    const ctaBadge =
      ctaWrap
        ? ctaWrap.querySelector(
            ":scope > span"
          )
        : null;


    if (ctaWrap) {
      ctaWrap.className = "";

      ctaWrap.style.margin = "0";
      ctaWrap.style.padding = "0";

      ctaWrap.style.display =
        state.ctaType ===
        CONFIG.cta.noneValue
          ? "none"
          : "block";
    }


    if (
      ctaBadge &&
      state.ctaType !==
        CONFIG.cta.noneValue
    ) {
      ctaBadge.className = "";

      ctaBadge.style.display =
        "inline-flex";

      ctaBadge.style.alignItems =
        "center";

      ctaBadge.style.justifyContent =
        "flex-start";

      ctaBadge.style.gap =
        "12px";

      ctaBadge.style.width =
        "auto";

      ctaBadge.style.height =
        "auto";

      ctaBadge.style.margin =
        "8px 0 0 0";

      ctaBadge.style.padding =
        "14px 24px";

      ctaBadge.style.backgroundColor =
        "#ffffff";

      ctaBadge.style.borderRadius =
        "9999px";

      ctaBadge.style.boxShadow =
        "0 2px 8px rgba(0,0,0,0.12)";

      ctaBadge.style.whiteSpace =
        "nowrap";
    }


    /*
      CTA DOT
    */

    if (ctaBadge) {
      const dot =
        ctaBadge.querySelector(
          "span:first-child"
        );

      if (dot) {
        dot.className = "";

        dot.style.display =
          "block";

        dot.style.flex =
          "0 0 12px";

        dot.style.width =
          "12px";

        dot.style.height =
          "12px";

        dot.style.borderRadius =
          "50%";

        dot.style.backgroundColor =
          "#B88A58";
      }
    }


    /*
      CTA TEXT

      We explicitly write the selected CTA again.
      So LINK IN BIO stays LINK IN BIO in export.
    */

    if (
      ctaLabel &&
      state.ctaType !==
        CONFIG.cta.noneValue
    ) {
      ctaLabel.className = "";

      ctaLabel.textContent =
        getCurrentCtaText();

      ctaLabel.style.display =
        "inline-block";

      ctaLabel.style.position =
        "relative";

      ctaLabel.style.fontFamily =
        "'Inter', sans-serif";

      ctaLabel.style.fontSize =
        "22px";

      ctaLabel.style.fontWeight =
        "700";

      ctaLabel.style.lineHeight =
        "1.15";

      ctaLabel.style.letterSpacing =
        "0.04em";

      ctaLabel.style.color =
        "#1F2937";

      ctaLabel.style.opacity =
        "1";

      ctaLabel.style.visibility =
        "visible";

      ctaLabel.style.whiteSpace =
        "nowrap";
    }


    return clone;
  }


  /* ==========================================================================
     18. EXPORT PNG
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


    /* ----------------------------------------------------------------------
       Loading UI
       ---------------------------------------------------------------------- */

    if (dom.downloadBtn) {
      dom.downloadBtn.disabled = true;

      dom.downloadBtn.classList.add(
        "opacity-90"
      );

      dom.downloadBtn.innerHTML =
        `${ICONS.spinner}<span>Generating 1000×1500 Pin...</span>`;
    }


    try {
      /* --------------------------------------------------------------------
         Wait for fonts
         -------------------------------------------------------------------- */

      if (
        document.fonts &&
        document.fonts.ready
      ) {
        await document.fonts.ready;
      }


      /* --------------------------------------------------------------------
         Build clone
         -------------------------------------------------------------------- */

      const clone =
        buildExportClone();


      /* --------------------------------------------------------------------
         Prepare export host
         -------------------------------------------------------------------- */

      dom.exportGhost.innerHTML = "";

      dom.exportGhost.style.setProperty(
        "position",
        "fixed",
        "important"
      );

      dom.exportGhost.style.setProperty(
        "left",
        "-10000px",
        "important"
      );

      dom.exportGhost.style.setProperty(
        "top",
        "0",
        "important"
      );

      dom.exportGhost.style.setProperty(
        "width",
        "1000px",
        "important"
      );

      dom.exportGhost.style.setProperty(
        "height",
        "1500px",
        "important"
      );

      dom.exportGhost.style.setProperty(
        "overflow",
        "hidden",
        "important"
      );

      dom.exportGhost.style.setProperty(
        "pointer-events",
        "none",
        "important"
      );

      dom.exportGhost.appendChild(
        clone
      );


      /*
        Let browser calculate the new
        1000 × 1500 layout before capture.
      */

      await waitForNextPaint();


      /* --------------------------------------------------------------------
         Wait for cloned image
         -------------------------------------------------------------------- */

      const exportImage =
        clone.querySelector(
          "#pinImage"
        );

      if (
        exportImage &&
        state.imageSrc &&
        !exportImage.complete
      ) {
        await new Promise(function (
          resolve
        ) {
          exportImage.onload =
            resolve;

          exportImage.onerror =
            resolve;
        });
      }


      await waitForNextPaint();


      /* --------------------------------------------------------------------
         Render
         -------------------------------------------------------------------- */

      if (
        typeof html2canvas ===
        "undefined"
      ) {
        throw new Error(
          "html2canvas is not loaded."
        );
      }


      const canvas =
        await html2canvas(
          clone,
          {
            width:
              CONFIG.export.width,

            height:
              CONFIG.export.height,

            scale: 1,

            useCORS: true,
            allowTaint: true,

            backgroundColor: null,

            logging: false,

            scrollX: 0,
            scrollY: 0,

            windowWidth:
              CONFIG.export.width,

            windowHeight:
              CONFIG.export.height,
          }
        );


      /* --------------------------------------------------------------------
         Safety check
         -------------------------------------------------------------------- */

      if (
        canvas.width !==
          CONFIG.export.width ||
        canvas.height !==
          CONFIG.export.height
      ) {
        console.warn(
          "Unexpected export size:",
          canvas.width,
          canvas.height
        );
      }


      const filename =
        generateFilename();


      /* --------------------------------------------------------------------
         iPhone / iPad / Safari
         -------------------------------------------------------------------- */

      if (isIOSDevice()) {
        /*
          iOS Safari is unreliable with:
          <a download="file.png">

          The most reliable browser-only method is
          opening the generated PNG itself.

          User can then:
          long press -> Save to Photos
          or Share -> Save to Files
        */

        const dataURL =
          canvas.toDataURL(
            "image/png",
            1
          );


        const imageWindow =
          window.open("", "_blank");


        if (imageWindow) {
          imageWindow.document.open();

          imageWindow.document.write(`
            <!DOCTYPE html>

            <html>
              <head>
                <meta charset="UTF-8">

                <meta
                  name="viewport"
                  content="width=device-width, initial-scale=1, viewport-fit=cover"
                >

                <title>${filename}</title>

                <style>
                  * {
                    box-sizing: border-box;
                  }

                  html,
                  body {
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    min-height: 100%;
                    background: #111827;
                  }

                  body {
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                  }

                  img {
                    display: block;
                    width: 100%;
                    max-width: 1000px;
                    height: auto;
                    margin: 0 auto;
                  }
                </style>
              </head>

              <body>
                <img
                  src="${dataURL}"
                  alt="PinForge Pinterest Pin"
                >
              </body>
            </html>
          `);

          imageWindow.document.close();

        } else {
          window.location.href =
            dataURL;
        }

      } else {

        /* ------------------------------------------------------------------
           Desktop / Android
           ------------------------------------------------------------------ */

        const blob =
          await new Promise(function (
            resolve
          ) {
            canvas.toBlob(
              resolve,
              "image/png",
              1
            );
          });


        if (!blob) {
          throw new Error(
            "Unable to create PNG."
          );
        }


        const blobURL =
          URL.createObjectURL(
            blob
          );


        const link =
          document.createElement(
            "a"
          );

        link.href =
          blobURL;

        link.download =
          filename;

        document.body.appendChild(
          link
        );

        link.click();

        link.remove();


        setTimeout(function () {
          URL.revokeObjectURL(
            blobURL
          );
        }, 5000);
      }


      /* --------------------------------------------------------------------
         Cleanup
         -------------------------------------------------------------------- */

      dom.exportGhost.innerHTML =
        "";


      /* --------------------------------------------------------------------
         Success UI
         -------------------------------------------------------------------- */

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
            "opacity-90",
            "pf-success"
          );

          dom.downloadBtn.innerHTML =
            `${ICONS.download}<span>Download PNG</span>`;
        }

        state.isExporting =
          false;

      }, CONFIG.successMessageDurationMs);


    } catch (error) {

      console.error(
        "PinForge export error:",
        error
      );


      dom.exportGhost.innerHTML =
        "";


      if (dom.downloadBtn) {
        dom.downloadBtn.disabled =
          false;

        dom.downloadBtn.classList.remove(
          "opacity-90",
          "pf-success"
        );

        dom.downloadBtn.innerHTML =
          `${ICONS.download}<span>Export Failed — Retry</span>`;
      }


      state.isExporting =
        false;
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
     19. HEADER EFFECT
     ========================================================================== */

  function setupChromeEffects() {
    if (!dom.siteHeader) return;

    window.addEventListener(
      "scroll",
      function () {
        dom.siteHeader.classList.toggle(
          "is-scrolled",

          window.scrollY >
            CONFIG
              .headerScrollThresholdPx
        );
      },

      { passive: true }
    );
  }


  /* ==========================================================================
     20. INITIAL STATE
     ========================================================================== */

  function setInitialState() {

    /* Image */

    resetImagePosition();


    /* Text */

    state.headline =
      dom.headlineInput
        ? dom.headlineInput.value
        : "";

    state.subheadline =
      dom.subheadlineInput
        ? dom.subheadlineInput.value
        : "";

    updateHeadline();
    updateSubheadline();


    /* Counters */

    if (dom.headlineCount) {
      dom.headlineCount.textContent =
        `${state.headline.length}/60`;
    }

    if (dom.subheadlineCount) {
      dom.subheadlineCount.textContent =
        `${state.subheadline.length}/80`;
    }


    /* Overlay */

    setOverlayStyle("bottom");


    /* Font */

    applyFont(
      "league-spartan"
    );


    /* Headline color */

    applyHeadlineColor(
      "#ffffff"
    );


    /* CTA */

    state.ctaType =
      CONFIG.cta.defaultValue;

    state.customCta = "";

    if (dom.ctaSelect) {
      dom.ctaSelect.value =
        CONFIG.cta.defaultValue;
    }

    if (dom.ctaCustomInput) {
      dom.ctaCustomInput.classList.add(
        "hidden"
      );
    }

    updateCtaDisplay();


    /* Customize starts closed */

    setCustomizePanel(false);


    /* Pill */

    setTimeout(
      updatePillPosition,
      100
    );
  }


  /* ==========================================================================
     21. INIT
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