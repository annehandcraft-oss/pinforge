/* ==========================================================================
   PinForge v0.2.2 — app.js
   FIXED:
   - Position Y benar-benar bergerak
   - Position X benar-benar bergerak
   - Zoom tetap bekerja
   - Upload image reset ke 100 / 50 / 50
   - Mobile floating preview TANPA membuat page flicker
   - Export exact 1000 × 1500
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
    fileInput:
      document.getElementById("fileInput") ||
      document.getElementById("imageInput"),

    removeImageBtn:
      document.getElementById("removeImageBtn"),

    pinImage:
      document.getElementById("pinImage"),

    pinPlaceholder:
      document.getElementById("pinPlaceholder") ||
      document.getElementById("pinImagePlaceholder"),

    // Image adjustments
    zoomSlider:
      document.getElementById("zoomSlider"),

    zoomValue:
      document.getElementById("zoomValue"),

    posXSlider:
      document.getElementById("posXSlider"),

    posYSlider:
      document.getElementById("posYSlider") ||
      document.getElementById("positionYInput"),

    posXValue:
      document.getElementById("posXValue"),

    posYValue:
      document.getElementById("posYValue") ||
      document.getElementById("positionYVal"),

    resetPositionBtn:
      document.getElementById("resetPositionBtn"),

    // Text
    headlineInput:
      document.getElementById("headlineInput"),

    subheadlineInput:
      document.getElementById("subheadlineInput"),

    headlineCount:
      document.getElementById("headlineCount"),

    subheadlineCount:
      document.getElementById("subheadlineCount"),

    pinHeadline:
      document.getElementById("pinHeadline"),

    pinSubheadline:
      document.getElementById("pinSubheadline"),

    // Overlay
    styleToggle:
      document.getElementById("styleToggle"),

    styleTogglePill:
      document.getElementById("styleTogglePill"),

    pinTextWrap:
      document.getElementById("pinTextWrap"),

    pinScrim:
      document.getElementById("pinScrim"),

    // Customize
    customizeToggleBtn:
      document.getElementById("customizeToggleBtn"),

    customizePanel:
      document.getElementById("customizePanel"),

    customizeChevron:
      document.getElementById("customizeChevron"),

    // Font
    fontSelector:
      document.getElementById("fontSelector"),

    // Color
    colorSelector:
      document.getElementById("colorSelector"),

    customColorSwatch:
      document.getElementById("customColorSwatch"),

    customColorInput:
      document.getElementById("customColorInput"),

    // CTA
    ctaSelect:
      document.getElementById("ctaSelect"),

    ctaCustomInput:
      document.getElementById("ctaCustomInput"),

    pinCtaWrap:
      document.getElementById("pinCtaWrap"),

    pinCtaLabel:
      document.getElementById("pinCtaLabel"),

    // Export
    downloadBtn:
      document.getElementById("downloadBtn"),

    pinCard:
      document.getElementById("pinCard"),

    exportGhost:
      document.getElementById("exportGhost"),
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
     IMAGE POSITION — FIXED
     ========================================================================== */

  function applyImageTransform() {
    if (!dom.pinImage) return;

    /*
      IMPORTANT FIX:

      We DO NOT translate the whole image anymore.

      object-fit: cover already crops the image.

      object-position controls WHICH PART of the image
      is visible inside that crop.

      Therefore:
      X slider = horizontal crop position
      Y slider = vertical crop position
      Zoom = scale only
    */

    const scale = state.zoom / 100;

    dom.pinImage.style.width = "100%";
    dom.pinImage.style.height = "100%";

    dom.pinImage.style.objectFit = "cover";

    dom.pinImage.style.objectPosition =
      `${state.posX}% ${state.posY}%`;

    dom.pinImage.style.transform =
      `scale(${scale})`;

    /*
      This is important for position X/Y while zoomed.
      Transform origin follows the selected focal point.
    */

    dom.pinImage.style.transformOrigin =
      `${state.posX}% ${state.posY}%`;
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

    if (dom.posXValue) {
      dom.posXValue.textContent =
        `${state.posX}%`;
    }

    if (dom.posYValue) {
      dom.posYValue.textContent =
        `${state.posY}%`;
    }

    applyImageTransform();
    syncFloatingPreview();
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
      alert("Please upload a PNG, JPG, or WebP image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be smaller than 10MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
      state.imageSrc =
        event.target.result;

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
        New image ALWAYS starts:
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

      setTimeout(syncFloatingPreview, 50);
    };

    reader.readAsDataURL(file);
  }


  function setupUpload() {
    if (!dom.fileInput) return;

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
          const files =
            event.dataTransfer?.files;

          if (files?.[0]) {
            handleFile(files[0]);
          }
        }
      );
    }


    dom.removeImageBtn?.addEventListener(
      "click",
      function (event) {
        event.preventDefault();
        event.stopPropagation();

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

        dom.removeImageBtn?.classList.add(
          "hidden"
        );

        if (dom.fileInput) {
          dom.fileInput.value = "";
        }

        resetImagePosition();
        syncFloatingPreview();
      }
    );
  }


  /* ==========================================================================
     IMAGE CONTROLS
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
          syncFloatingPreview();
        }
      );
    }


    if (dom.posXSlider) {
      dom.posXSlider.addEventListener(
        "input",
        function (event) {
          state.posX =
            Number(event.target.value);

          if (dom.posXValue) {
            dom.posXValue.textContent =
              `${state.posX}%`;
          }

          applyImageTransform();
          syncFloatingPreview();
        }
      );
    }


    /*
      THIS is the Position Y fix.
    */

    if (dom.posYSlider) {
      dom.posYSlider.addEventListener(
        "input",
        function (event) {
          state.posY =
            Number(event.target.value);

          if (dom.posYValue) {
            dom.posYValue.textContent =
              `${state.posY}%`;
          }

          applyImageTransform();
          syncFloatingPreview();
        }
      );
    }


    dom.resetPositionBtn?.addEventListener(
      "click",
      function () {
        resetImagePosition();
      }
    );
  }


  /* ==========================================================================
     TEXT
     ========================================================================== */

  function setupTextPreview() {

    if (
      dom.headlineInput &&
      dom.pinHeadline
    ) {
      dom.headlineInput.addEventListener(
        "input",
        function (event) {
          state.headline =
            event.target.value;

          dom.pinHeadline.textContent =
            state.headline.trim() ||
            CONFIG.text.headlineFallback;

          if (dom.headlineCount) {
            dom.headlineCount.textContent =
              `${state.headline.length}/60`;
          }

          syncFloatingPreview();
        }
      );
    }


    if (
      dom.subheadlineInput &&
      dom.pinSubheadline
    ) {
      dom.subheadlineInput.addEventListener(
        "input",
        function (event) {
          state.subheadline =
            event.target.value;

          dom.pinSubheadline.textContent =
            state.subheadline.trim() ||
            CONFIG.text.subheadlineFallback;

          if (dom.subheadlineCount) {
            dom.subheadlineCount.textContent =
              `${state.subheadline.length}/80`;
          }

          syncFloatingPreview();
        }
      );
    }
  }


  /* ==========================================================================
     OVERLAY
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

    syncFloatingPreview();
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
     CUSTOMIZE ACCORDION
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
     FONT
     ========================================================================== */

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

        syncFloatingPreview();
      }
    );
  }


  /* ==========================================================================
     COLOR
     ========================================================================== */

  function applyHeadlineColor(color) {
    state.color = color;

    if (dom.pinHeadline) {
      dom.pinHeadline.style.color =
        color;
    }

    syncFloatingPreview();
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
          swatch.dataset.color;

        if (!color) return;

        applyHeadlineColor(color);


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

      syncFloatingPreview();
      return;
    }


    dom.pinCtaWrap.classList.remove(
      "hidden"
    );


    let label =
      state.ctaType;


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

    syncFloatingPreview();
  }


  function setupCtaSelector() {
    if (!dom.ctaSelect) return;


    dom.ctaSelect.addEventListener(
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
     MOBILE FLOATING PREVIEW
     ========================================================================== */

  let floatingPreview = null;
  let floatingCard = null;


  function createFloatingPreview() {
    if (
      floatingPreview ||
      !dom.pinCard
    ) {
      return;
    }


    floatingPreview =
      document.createElement("div");

    floatingPreview.id =
      "pfFloatingPreview";


    /*
      IMPORTANT:

      position: fixed means this preview DOES NOT
      affect document layout.

      Therefore no page jumping / flickering.
    */

    Object.assign(
      floatingPreview.style,
      {
        position: "fixed",
        top: "76px",
        right: "12px",
        width: "128px",
        zIndex: "999",
        display: "none",
        pointerEvents: "none",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow:
          "0 10px 30px rgba(0,0,0,0.22)",
        background: "#ffffff",
      }
    );


    document.body.appendChild(
      floatingPreview
    );

    syncFloatingPreview();
  }


  function syncFloatingPreview() {
    if (
      !floatingPreview ||
      !dom.pinCard
    ) {
      return;
    }


    /*
      Rebuild clone.

      This is intentionally separate from the
      real #pinCard.

      The actual card NEVER becomes sticky.
    */

    floatingPreview.innerHTML = "";

    floatingCard =
      dom.pinCard.cloneNode(true);


    /*
      Remove duplicate IDs from clone.
      Avoids duplicate-ID JS conflicts.
    */

    floatingCard
      .querySelectorAll("[id]")
      .forEach(function (element) {
        element.removeAttribute("id");
      });


    floatingCard.removeAttribute("id");


    Object.assign(
      floatingCard.style,
      {
        width: "128px",
        maxWidth: "128px",
        height: "192px",
        aspectRatio: "2 / 3",
        margin: "0",
        borderRadius: "10px",
        boxShadow: "none",
        transform: "none",
      }
    );


    floatingPreview.appendChild(
      floatingCard
    );
  }


  function updateFloatingVisibility() {
    if (!floatingPreview) return;


    /*
      Desktop:
      don't need mini preview.
    */

    if (window.innerWidth >= 1024) {
      floatingPreview.style.display =
        "none";

      return;
    }


    if (!dom.pinCard) return;


    const rect =
      dom.pinCard.getBoundingClientRect();


    /*
      Show floating preview only AFTER
      the original card leaves the screen.

      Hysteresis prevents rapid on/off flicker.
    */

    const shouldShow =
      rect.bottom < 65;


    floatingPreview.style.display =
      shouldShow ? "block" : "none";
  }


  function setupFloatingPreview() {
    createFloatingPreview();

    let ticking = false;


    function requestUpdate() {
      if (ticking) return;

      ticking = true;


      requestAnimationFrame(function () {
        updateFloatingVisibility();

        ticking = false;
      });
    }


    window.addEventListener(
      "scroll",
      requestUpdate,
      { passive: true }
    );


    window.addEventListener(
      "resize",
      function () {
        requestUpdate();
      },
      { passive: true }
    );


    requestUpdate();
  }


  /* ==========================================================================
     EXPORT — EXACT 1000 × 1500
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


      clone.style.width =
        `${CONFIG.export.width}px`;

      clone.style.height =
        `${CONFIG.export.height}px`;

      clone.style.minWidth =
        `${CONFIG.export.width}px`;

      clone.style.maxWidth =
        `${CONFIG.export.width}px`;

      clone.style.aspectRatio =
        "2 / 3";

      clone.style.transform =
        "none";

      clone.style.borderRadius =
        "0";

      clone.style.boxShadow =
        "none";

      clone.style.margin =
        "0";


      /* IMAGE */

      const cloneImage =
        clone.querySelector(
          "#pinImage"
        );


      if (cloneImage) {
        cloneImage.style.width =
          "100%";

        cloneImage.style.height =
          "100%";

        cloneImage.style.objectFit =
          "cover";

        cloneImage.style.objectPosition =
          `${state.posX}% ${state.posY}%`;

        cloneImage.style.transform =
          `scale(${state.zoom / 100})`;

        cloneImage.style.transformOrigin =
          `${state.posX}% ${state.posY}%`;
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

        cloneHeadline.style.lineHeight =
          "1.05";
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

        cloneSubheadline.style.lineHeight =
          "1.25";
      }


      dom.exportGhost.innerHTML =
        "";


      Object.assign(
        dom.exportGhost.style,
        {
          width:
            `${CONFIG.export.width}px`,

          height:
            `${CONFIG.export.height}px`,
        }
      );


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
          }
        );


      let filename =
        state.headline.trim() ||
        "pinforge-pin";


      filename =
        filename
          .toLowerCase()
          .replace(
            /[^a-z0-9]+/g,
            "-"
          )
          .replace(
            /^-+|-+$/g,
            ""
          );


      filename +=
        "-1000x1500.png";


      /*
        iOS Safari:
        Blob + Web Share if available.
        This is much more reliable than
        anchor.download on iPhone.
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


      if (isIOS && canvas.toBlob) {

        const blob =
          await new Promise(
            function (resolve) {
              canvas.toBlob(
                resolve,
                "image/png",
                1
              );
            }
          );


        if (!blob) {
          throw new Error(
            "Unable to create PNG."
          );
        }


        const file =
          new File(
            [blob],
            filename,
            {
              type: "image/png",
            }
          );


        /*
          iPhone Safari:
          Share sheet allows Save Image
          or Save to Files.
        */

        if (
          navigator.share &&
          navigator.canShare &&
          navigator.canShare({
            files: [file],
          })
        ) {
          await navigator.share({
            files: [file],
            title: "PinForge Pin",
          });

        } else {

          /*
            Fallback:
            Open PNG directly.
            User can long-press → Save Image.
          */

          const blobUrl =
            URL.createObjectURL(
              blob
            );


          window.open(
            blobUrl,
            "_blank"
          );


          setTimeout(
            function () {
              URL.revokeObjectURL(
                blobUrl
              );
            },
            60000
          );
        }

      } else {

        /*
          Desktop / Android
        */

        const link =
          document.createElement(
            "a"
          );


        link.download =
          filename;


        link.href =
          canvas.toDataURL(
            "image/png"
          );


        document.body.appendChild(
          link
        );


        link.click();


        link.remove();
      }


      dom.exportGhost.innerHTML =
        "";


      if (dom.downloadBtn) {
        dom.downloadBtn.classList.add(
          "pf-success"
        );


        dom.downloadBtn.innerHTML =
          `${ICONS.check}<span>Pin Ready!</span>`;
      }


      setTimeout(
        function () {
          if (dom.downloadBtn) {
            dom.downloadBtn.disabled =
              false;


            dom.downloadBtn.classList.remove(
              "pf-success"
            );


            dom.downloadBtn.innerHTML =
              `${ICONS.download}<span>Download PNG</span>`;
          }


          state.isExporting =
            false;
        },
        CONFIG.successMessageDurationMs
      );


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


        dom.downloadBtn.innerHTML =
          `${ICONS.download}<span>Export Failed — Retry</span>`;
      }


      state.isExporting =
        false;
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


    setOverlayStyle(
      "bottom"
    );


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


    setCustomizePanel(
      false
    );


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


    setInitialState();


    /*
      Create floating preview LAST,
      after initial card state is ready.
    */

    setupFloatingPreview();


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