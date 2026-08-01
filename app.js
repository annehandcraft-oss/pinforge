/* ==========================================================================
   PinForge v0.2 — app.js
   Stable Build
   - Mobile floating preview
   - Position X / Y
   - Zoom
   - Correct image export
   - CTA drawn directly onto export canvas
   ========================================================================== */

(function () {
  "use strict";

  /* ==========================================================================
     1. CONFIG
     ========================================================================== */

  const CONFIG = {
    exportWidth: 1000,
    exportHeight: 1500,

    zoomDefault: 100,
    positionDefault: 50,

    imageMoveRange: 10,

    mobileBreakpoint: 1024,
    mobileFloatingTop: 72,

    successDuration: 1600,
  };


  /* ==========================================================================
     2. FONT MAP
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
     3. STATE
     ========================================================================== */

  const state = {
    imageSrc: null,

    zoom: CONFIG.zoomDefault,
    posX: CONFIG.positionDefault,
    posY: CONFIG.positionDefault,

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
     4. DOM
     ========================================================================== */

  const dom = {
    siteHeader: document.getElementById("siteHeader"),

    // Upload
    dropzone: document.getElementById("dropzone"),
    fileInput: document.getElementById("fileInput"),
    removeImageBtn: document.getElementById("removeImageBtn"),

    // Preview
    pinCard: document.getElementById("pinCard"),
    pinImage: document.getElementById("pinImage"),
    pinPlaceholder: document.getElementById("pinPlaceholder"),
    pinTextWrap: document.getElementById("pinTextWrap"),
    pinScrim: document.getElementById("pinScrim"),

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

    // Customize
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
    exportGhost: document.getElementById("exportGhost"),
  };


  /* ==========================================================================
     5. IMAGE TRANSFORM
     ========================================================================== */

  function getImageTransform() {
    const scale = state.zoom / 100;

    const x =
      ((state.posX - 50) / 50) *
      CONFIG.imageMoveRange;

    const y =
      ((state.posY - 50) / 50) *
      CONFIG.imageMoveRange;

    return `translate3d(${x}%, ${y}%, 0) scale(${scale})`;
  }


  function applyImageTransform(imageElement = dom.pinImage) {
    if (!imageElement) return;

    imageElement.style.transform =
      getImageTransform();

    imageElement.style.transformOrigin =
      "center center";

    imageElement.style.objectPosition =
      "50% 50%";
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
    state.zoom = CONFIG.zoomDefault;
    state.posX = CONFIG.positionDefault;
    state.posY = CONFIG.positionDefault;

    updateImageControls();
  }


  /* ==========================================================================
     6. IMAGE UPLOAD
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
      const src = event.target.result;

      if (!src) return;

      state.imageSrc = src;

      if (dom.pinImage) {
        dom.pinImage.src = src;
        dom.pinImage.classList.remove("hidden");
        dom.pinImage.classList.add("pf-animate-in");
      }

      if (dom.pinPlaceholder) {
        dom.pinPlaceholder.classList.add("hidden");
      }

      if (dom.removeImageBtn) {
        dom.removeImageBtn.classList.remove("hidden");
      }

      resetImagePosition();

      setTimeout(function () {
        dom.pinImage?.classList.remove(
          "pf-animate-in"
        );
      }, 500);
    };

    reader.readAsDataURL(file);
  }


  function removeImage() {
    state.imageSrc = null;

    if (dom.pinImage) {
      dom.pinImage.src = "";
      dom.pinImage.classList.add("hidden");
    }

    if (dom.pinPlaceholder) {
      dom.pinPlaceholder.classList.remove("hidden");
    }

    if (dom.removeImageBtn) {
      dom.removeImageBtn.classList.add("hidden");
    }

    if (dom.fileInput) {
      dom.fileInput.value = "";
    }

    resetImagePosition();
  }


  function setupUpload() {
    dom.fileInput?.addEventListener(
      "change",
      function (event) {
        const file =
          event.target.files?.[0];

        if (file) {
          handleFile(file);
        }
      }
    );


    if (dom.dropzone) {
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
          const file =
            event.dataTransfer?.files?.[0];

          if (file) {
            handleFile(file);
          }
        }
      );
    }


    dom.removeImageBtn?.addEventListener(
      "click",
      function (event) {
        event.preventDefault();
        event.stopPropagation();

        removeImage();
      }
    );
  }


  /* ==========================================================================
     7. IMAGE CONTROLS
     ========================================================================== */

  function setupImageControls() {
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
      function (event) {
        event.preventDefault();

        resetImagePosition();
      }
    );
  }


  /* ==========================================================================
     8. TEXT
     ========================================================================== */

  function renderHeadline() {
    if (!dom.pinHeadline) return;

    dom.pinHeadline.textContent =
      state.headline.trim() ||
      "Your Headline Here";
  }


  function renderSubheadline() {
    if (!dom.pinSubheadline) return;

    dom.pinSubheadline.textContent =
      state.subheadline.trim() ||
      "Add a subheadline for extra detail";
  }


  function setupText() {
    dom.headlineInput?.addEventListener(
      "input",
      function (event) {
        state.headline =
          event.target.value;

        renderHeadline();

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

        renderSubheadline();

        if (dom.subheadlineCount) {
          dom.subheadlineCount.textContent =
            `${state.subheadline.length}/80`;
        }
      }
    );
  }


  /* ==========================================================================
     9. OVERLAY
     ========================================================================== */

  const OVERLAY_CLASSES = {
    bottom: {
      wrap:
        "absolute inset-x-0 bottom-0 p-[6%] flex flex-col gap-2 text-left items-start z-10",

      scrim:
        "absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-black/70 via-black/25 to-transparent pointer-events-none z-[5]",
    },

    center: {
      wrap:
        "absolute inset-x-0 top-1/2 -translate-y-1/2 p-[6%] flex flex-col items-center text-center gap-2 z-10",

      scrim:
        "absolute inset-0 bg-black/35 pointer-events-none z-[5]",
    },

    top: {
      wrap:
        "absolute inset-x-0 top-0 p-[6%] flex flex-col gap-2 text-left items-start z-10",

      scrim:
        "absolute inset-x-0 top-0 h-[46%] bg-gradient-to-b from-black/70 via-black/25 to-transparent pointer-events-none z-[5]",
    },
  };


  function updateStylePill() {
    if (
      !dom.styleToggle ||
      !dom.styleTogglePill
    ) {
      return;
    }

    const active =
      dom.styleToggle.querySelector(
        `[data-style="${state.style}"]`
      );

    if (!active) return;

    const parentRect =
      dom.styleToggle.getBoundingClientRect();

    const activeRect =
      active.getBoundingClientRect();

    dom.styleTogglePill.style.width =
      `${activeRect.width}px`;

    dom.styleTogglePill.style.transform =
      `translateX(${
        activeRect.left -
        parentRect.left -
        4
      }px)`;
  }


  function setOverlayStyle(style) {
    if (!OVERLAY_CLASSES[style]) return;

    state.style = style;

    if (dom.pinTextWrap) {
      dom.pinTextWrap.className =
        OVERLAY_CLASSES[style].wrap;
    }

    if (dom.pinScrim) {
      dom.pinScrim.className =
        OVERLAY_CLASSES[style].scrim;
    }

    dom.styleToggle
      ?.querySelectorAll(".style-btn")
      .forEach(function (button) {
        button.classList.toggle(
          "is-active",
          button.dataset.style === style
        );
      });

    requestAnimationFrame(
      updateStylePill
    );
  }


  function setupOverlay() {
    dom.styleToggle?.addEventListener(
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
      updateStylePill
    );
  }


  /* ==========================================================================
     10. CUSTOMIZE PANEL
     ========================================================================== */

  function setCustomizeOpen(open) {
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


  function setupCustomize() {
    setCustomizeOpen(false);

    dom.customizeToggleBtn?.addEventListener(
      "click",
      function () {
        setCustomizeOpen(
          !state.isCustomizingOpen
        );
      }
    );
  }


  /* ==========================================================================
     11. FONT
     ========================================================================== */

  function applyFont() {
    if (!dom.pinHeadline) return;

    dom.pinHeadline.style.fontFamily =
      FONT_FAMILIES[state.font] ||
      FONT_FAMILIES["league-spartan"];
  }


  function setupFonts() {
    dom.fontSelector?.addEventListener(
      "click",
      function (event) {
        const chip =
          event.target.closest(
            ".font-chip"
          );

        if (!chip) return;

        const font =
          chip.dataset.font;

        if (!FONT_FAMILIES[font]) {
          return;
        }

        state.font = font;

        dom.fontSelector
          .querySelectorAll(".font-chip")
          .forEach(function (item) {
            item.classList.toggle(
              "is-active",
              item === chip
            );
          });

        applyFont();
      }
    );
  }


  /* ==========================================================================
     12. COLOR
     ========================================================================== */

  function applyColor(color) {
    state.color = color;

    if (dom.pinHeadline) {
      dom.pinHeadline.style.color =
        color;
    }
  }


  function setActiveColor(target) {
    dom.colorSelector
      ?.querySelectorAll(
        ".color-swatch"
      )
      .forEach(function (item) {
        item.classList.toggle(
          "is-active",
          item === target
        );
      });
  }


  function setupColors() {
    dom.colorSelector?.addEventListener(
      "click",
      function (event) {
        const swatch =
          event.target.closest(
            ".color-swatch:not(.color-swatch--custom)"
          );

        if (!swatch) return;

        const color =
          swatch.dataset.color;

        if (!color) return;

        applyColor(color);
        setActiveColor(swatch);
      }
    );


    dom.customColorInput?.addEventListener(
      "input",
      function (event) {
        applyColor(
          event.target.value
        );

        if (
          dom.customColorSwatch
        ) {
          setActiveColor(
            dom.customColorSwatch
          );
        }
      }
    );
  }


  /* ==========================================================================
     13. CTA
     ========================================================================== */

  function getCtaText() {
    if (state.ctaType === "none") {
      return "";
    }

    if (state.ctaType === "custom") {
      return (
        state.customCta.trim() ||
        "SHOP NOW"
      );
    }

    return state.ctaType;
  }


  function renderCTA() {
    if (
      !dom.pinCtaWrap ||
      !dom.pinCtaLabel
    ) {
      return;
    }

    const text = getCtaText();

    if (!text) {
      dom.pinCtaWrap.classList.add(
        "hidden"
      );

      return;
    }

    dom.pinCtaWrap.classList.remove(
      "hidden"
    );

    dom.pinCtaLabel.textContent =
      text;
  }


  function setupCTA() {
    dom.ctaSelect?.addEventListener(
      "change",
      function (event) {
        state.ctaType =
          event.target.value;

        if (dom.ctaCustomInput) {
          dom.ctaCustomInput.classList.toggle(
            "hidden",
            state.ctaType !==
              "custom"
          );
        }

        renderCTA();
      }
    );


    dom.ctaCustomInput?.addEventListener(
      "input",
      function (event) {
        state.customCta =
          event.target.value;

        renderCTA();
      }
    );
  }


  /* ==========================================================================
     14. MOBILE FLOATING PREVIEW
     ========================================================================== */

  let floatingTicking = false;


  function updateMobileFloatingPreview() {
    floatingTicking = false;

    if (!dom.pinCard) return;


    if (
      window.innerWidth >=
      CONFIG.mobileBreakpoint
    ) {
      dom.pinCard.classList.remove(
        "pf-mobile-floating"
      );

      return;
    }


    const editorSection =
      document.querySelector(
        "main > div > section:first-child"
      );

    if (!editorSection) return;


    const editorRect =
      editorSection.getBoundingClientRect();


    const shouldFloat =
      editorRect.top <
        CONFIG.mobileFloatingTop &&
      editorRect.bottom > 180;


    dom.pinCard.classList.toggle(
      "pf-mobile-floating",
      shouldFloat
    );
  }


  function requestFloatingUpdate() {
    if (floatingTicking) return;

    floatingTicking = true;

    requestAnimationFrame(
      updateMobileFloatingPreview
    );
  }


  function setupMobilePreview() {
    window.addEventListener(
      "scroll",
      requestFloatingUpdate,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      requestFloatingUpdate,
      { passive: true }
    );


    if (window.visualViewport) {
      window.visualViewport.addEventListener(
        "resize",
        requestFloatingUpdate,
        { passive: true }
      );
    }


    updateMobileFloatingPreview();
  }


  /* ==========================================================================
     15. HEADER
     ========================================================================== */

  function setupHeader() {
    window.addEventListener(
      "scroll",
      function () {
        dom.siteHeader?.classList.toggle(
          "is-scrolled",
          window.scrollY > 8
        );
      },
      { passive: true }
    );
  }


  /* ==========================================================================
     16. EXPORT HELPERS
     ========================================================================== */

  function makeFilename() {
    let name =
      state.headline.trim() ||
      "pinforge-pin";

    name = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 50);

    return `${name}-1000x1500.png`;
  }


  function setExportButtonLoading() {
    if (!dom.downloadBtn) return;

    dom.downloadBtn.disabled = true;

    dom.downloadBtn.innerHTML = `
      <svg
        class="pf-spin"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        stroke-width="2"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke-opacity="0.3"
        />
        <path
          d="M21 12a9 9 0 0 0-9-9"
        />
      </svg>

      <span>
        Generating 1000×1500...
      </span>
    `;
  }


  function setExportButtonSuccess() {
    if (!dom.downloadBtn) return;

    dom.downloadBtn.classList.add(
      "pf-success"
    );

    dom.downloadBtn.innerHTML = `
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M5 13l4 4L19 7"/>
      </svg>

      <span>Pin Ready!</span>
    `;
  }


  function resetExportButton() {
    if (!dom.downloadBtn) return;

    dom.downloadBtn.disabled = false;

    dom.downloadBtn.classList.remove(
      "pf-success"
    );

    dom.downloadBtn.innerHTML = `
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 16V4M12 16l-4-4M12 16l4-4"/>
        <path d="M4 20h16"/>
      </svg>

      <span>Download PNG</span>
    `;
  }


  async function waitForCloneImage(
    clone
  ) {
    const image =
      clone.querySelector(
        "#pinImage"
      );

    if (
      !image ||
      !image.src
    ) {
      return;
    }


    if (image.complete) {
      try {
        await image.decode();
      } catch (_) {}

      return;
    }


    await new Promise(
      function (resolve) {
        image.onload = resolve;
        image.onerror = resolve;
      }
    );
  }


  /* ==========================================================================
     17. CANVAS CTA
     ========================================================================== */

  function roundedRect(
    ctx,
    x,
    y,
    width,
    height,
    radius
  ) {
    const r =
      Math.min(
        radius,
        width / 2,
        height / 2
      );

    ctx.beginPath();

    ctx.moveTo(
      x + r,
      y
    );

    ctx.lineTo(
      x + width - r,
      y
    );

    ctx.quadraticCurveTo(
      x + width,
      y,
      x + width,
      y + r
    );

    ctx.lineTo(
      x + width,
      y + height - r
    );

    ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - r,
      y + height
    );

    ctx.lineTo(
      x + r,
      y + height
    );

    ctx.quadraticCurveTo(
      x,
      y + height,
      x,
      y + height - r
    );

    ctx.lineTo(
      x,
      y + r
    );

    ctx.quadraticCurveTo(
      x,
      y,
      x + r,
      y
    );

    ctx.closePath();
  }


  function drawCanvasCTA(
    canvas,
    clone,
    originalCtaRect
  ) {
    const text =
      getCtaText();

    if (!text) return;


    const ctx =
      canvas.getContext("2d");

    if (!ctx) return;


    /*
      CTA position is calculated from its
      actual position in the 1000x1500 export clone.

      That means Bottom / Center / Top all stay aligned
      with the text overlay automatically.
    */

    const cloneRect =
      clone.getBoundingClientRect();


    let x = 60;
    let y = 1200;


    if (originalCtaRect) {
      x =
        originalCtaRect.left -
        cloneRect.left;

      y =
        originalCtaRect.top -
        cloneRect.top;
    }


    ctx.save();


    /*
      Badge typography.
    */

    const fontSize = 24;

    ctx.font =
      `700 ${fontSize}px Inter, Arial, sans-serif`;

    ctx.textBaseline =
      "middle";


    const metrics =
      ctx.measureText(text);


    const textWidth =
      metrics.width;


    /*
      Badge dimensions.
    */

    const height = 58;

    const paddingLeft = 24;
    const paddingRight = 26;

    const dotSize = 10;
    const dotGap = 14;

    const width =
      paddingLeft +
      dotSize +
      dotGap +
      textWidth +
      paddingRight;


    /*
      White badge.
    */

    ctx.shadowColor =
      "rgba(0,0,0,0.14)";

    ctx.shadowBlur = 12;

    ctx.shadowOffsetY = 4;


    ctx.fillStyle =
      "rgba(255,255,255,0.97)";


    roundedRect(
      ctx,
      x,
      y,
      width,
      height,
      height / 2
    );


    ctx.fill();


    /*
      Remove shadow before drawing
      dot and text.
    */

    ctx.shadowColor =
      "transparent";

    ctx.shadowBlur = 0;

    ctx.shadowOffsetY = 0;


    /*
      Gold dot.
    */

    const dotX =
      x +
      paddingLeft +
      dotSize / 2;

    const centerY =
      y +
      height / 2;


    ctx.beginPath();

    ctx.arc(
      dotX,
      centerY,
      dotSize / 2,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      "#B88A58";

    ctx.fill();


    /*
      Dark CTA text.
    */

    const textX =
      x +
      paddingLeft +
      dotSize +
      dotGap;


    ctx.fillStyle =
      "#1F2937";

    ctx.font =
      `700 ${fontSize}px Inter, Arial, sans-serif`;

    ctx.textBaseline =
      "middle";

    ctx.textAlign =
      "left";


    ctx.fillText(
      text,
      textX,
      centerY + 1
    );


    ctx.restore();
  }


  /* ==========================================================================
     18. EXPORT
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

    setExportButtonLoading();


    try {

      /*
        Wait for fonts.
      */

      if (document.fonts?.ready) {
        await document.fonts.ready;
      }


      /*
        Clone current pin.
      */

      const clone =
        dom.pinCard.cloneNode(true);


      clone.classList.remove(
        "pf-mobile-floating"
      );


      clone.id =
        "pinCardExport";


      /*
        Exact export dimensions.
      */

      clone.style.position =
        "relative";

      clone.style.top =
        "auto";

      clone.style.right =
        "auto";

      clone.style.left =
        "auto";

      clone.style.width =
        `${CONFIG.exportWidth}px`;

      clone.style.height =
        `${CONFIG.exportHeight}px`;

      clone.style.minWidth =
        `${CONFIG.exportWidth}px`;

      clone.style.maxWidth =
        `${CONFIG.exportWidth}px`;

      clone.style.aspectRatio =
        "auto";

      clone.style.margin =
        "0";

      clone.style.borderRadius =
        "0";

      clone.style.boxShadow =
        "none";

      clone.style.transform =
        "none";


      /*
        IMAGE
      */

      const cloneImage =
        clone.querySelector(
          "#pinImage"
        );


      if (cloneImage) {
        cloneImage.style.position =
          "absolute";

        cloneImage.style.width =
          "120%";

        cloneImage.style.height =
          "120%";

        cloneImage.style.left =
          "-10%";

        cloneImage.style.top =
          "-10%";

        cloneImage.style.maxWidth =
          "none";

        cloneImage.style.objectFit =
          "cover";

        cloneImage.style.objectPosition =
          "50% 50%";

        cloneImage.style.transform =
          getImageTransform();

        cloneImage.style.transformOrigin =
          "center center";
      }


      /*
        TYPOGRAPHY
      */

      const cloneHeadline =
        clone.querySelector(
          "#pinHeadline"
        );


      if (cloneHeadline) {
        cloneHeadline.style.fontSize =
          "72px";

        cloneHeadline.style.lineHeight =
          "1.08";

        cloneHeadline.style.fontFamily =
          FONT_FAMILIES[state.font] ||
          FONT_FAMILIES[
            "league-spartan"
          ];

        cloneHeadline.style.color =
          state.color;
      }


      const cloneSubheadline =
        clone.querySelector(
          "#pinSubheadline"
        );


      if (cloneSubheadline) {
        cloneSubheadline.style.fontSize =
          "34px";

        cloneSubheadline.style.lineHeight =
          "1.25";
      }


      /*
        Put clone into export ghost.
      */

      dom.exportGhost.innerHTML =
        "";

      dom.exportGhost.style.width =
        `${CONFIG.exportWidth}px`;

      dom.exportGhost.style.height =
        `${CONFIG.exportHeight}px`;

      dom.exportGhost.appendChild(
        clone
      );


      await waitForCloneImage(
        clone
      );


      /*
        Wait for final layout.
      */

      await new Promise(
        function (resolve) {
          requestAnimationFrame(
            function () {
              requestAnimationFrame(
                resolve
              );
            }
          );
        }
      );


      /*
        CTA IMPORTANT:

        Capture CTA's position BEFORE hiding it.

        html2canvas will NOT render the CTA.
        We draw it ourselves afterwards.
      */

      const cloneCtaWrap =
        clone.querySelector(
          "#pinCtaWrap"
        );


      let ctaRect = null;


      if (
        cloneCtaWrap &&
        getCtaText()
      ) {
        ctaRect =
          cloneCtaWrap.getBoundingClientRect();

        cloneCtaWrap.style.visibility =
          "hidden";
      }


      /*
        Render main pin.
      */

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
              CONFIG.exportWidth,

            height:
              CONFIG.exportHeight,

            scale: 1,

            useCORS: true,

            backgroundColor: null,

            logging: false,

            windowWidth:
              CONFIG.exportWidth,

            windowHeight:
              CONFIG.exportHeight,
          }
        );


      /*
        Draw CTA DIRECTLY onto PNG canvas.

        Bye bye invisible CTA text. 🫵🏻
      */

      drawCanvasCTA(
        canvas,
        clone,
        ctaRect
      );


      /*
        Filename.
      */

      const filename =
        makeFilename();


      /*
        iOS detection.
      */

      const isIOS =
        /iPad|iPhone|iPod/.test(
          navigator.userAgent
        ) ||
        (
          navigator.platform ===
            "MacIntel" &&
          navigator.maxTouchPoints > 1
        );


      /*
        iOS:
        open image in new tab.
      */

      if (isIOS) {
        const dataUrl =
          canvas.toDataURL(
            "image/png",
            1
          );


        const newWindow =
          window.open();


        if (newWindow) {
          newWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <meta
                  name="viewport"
                  content="width=device-width,initial-scale=1"
                >

                <title>${filename}</title>

                <style>
                  html,
                  body {
                    margin: 0;
                    padding: 0;
                    background: #111827;
                    min-height: 100%;
                  }

                  body {
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                  }

                  img {
                    display: block;
                    width: 100%;
                    height: auto;
                    max-width: 1000px;
                  }
                </style>
              </head>

              <body>
                <img
                  src="${dataUrl}"
                  alt="Pinterest Pin"
                >
              </body>
            </html>
          `);

          newWindow.document.close();

        } else {

          window.location.href =
            dataUrl;
        }


      } else {

        /*
          Desktop / Android.
        */

        const dataUrl =
          canvas.toDataURL(
            "image/png",
            1
          );


        const link =
          document.createElement(
            "a"
          );


        link.href =
          dataUrl;

        link.download =
          filename;


        document.body.appendChild(
          link
        );

        link.click();

        link.remove();
      }


      /*
        Cleanup.
      */

      dom.exportGhost.innerHTML =
        "";


      setExportButtonSuccess();


      setTimeout(
        function () {
          resetExportButton();

          state.isExporting =
            false;
        },
        CONFIG.successDuration
      );


    } catch (error) {

      console.error(
        "PinForge export error:",
        error
      );


      dom.exportGhost.innerHTML =
        "";


      resetExportButton();


      state.isExporting =
        false;


      alert(
        "Export failed. Please try again."
      );
    }
  }


  function setupExporter() {
    dom.downloadBtn?.addEventListener(
      "click",
      exportPin
    );
  }


  /* ==========================================================================
     19. INITIAL STATE
     ========================================================================== */

  function setInitialState() {
    state.headline =
      dom.headlineInput?.value ||
      "";

    state.subheadline =
      dom.subheadlineInput?.value ||
      "";


    resetImagePosition();


    setOverlayStyle(
      "bottom"
    );


    state.font =
      "league-spartan";

    applyFont();


    applyColor(
      "#ffffff"
    );


    state.ctaType =
      dom.ctaSelect?.value ||
      "SHOP ON ETSY";


    state.customCta =
      dom.ctaCustomInput?.value ||
      "";


    renderCTA();


    setCustomizeOpen(
      false
    );


    if (dom.headlineCount) {
      dom.headlineCount.textContent =
        `${state.headline.length}/60`;
    }


    if (dom.subheadlineCount) {
      dom.subheadlineCount.textContent =
        `${state.subheadline.length}/80`;
    }


    renderHeadline();
    renderSubheadline();


    setTimeout(
      updateStylePill,
      100
    );
  }


  /* ==========================================================================
     20. INIT
     ========================================================================== */

  function init() {
    setupUpload();

    setupImageControls();

    setupText();

    setupOverlay();

    setupCustomize();

    setupFonts();

    setupColors();

    setupCTA();

    setupMobilePreview();

    setupExporter();

    setupHeader();

    setInitialState();


    console.log(
      "PinForge stable CTA canvas build initialized ✨"
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