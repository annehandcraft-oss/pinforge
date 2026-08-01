/* ==========================================================================
   PinForge v0.6 — app.js
   Stable Floating Preview + Image Position + Clean Export + HTML Export CTA
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

    mobileBreakpoint: 1024,
    mobileFloatingTop: 76,

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
     5. IMAGE POSITION / ZOOM
     ========================================================================== */

  function applyImageTransform(imageElement = dom.pinImage) {
    if (!imageElement) return;

    imageElement.style.objectPosition =
      `${state.posX}% ${state.posY}%`;

    imageElement.style.transform =
      `scale(${state.zoom / 100})`;

    imageElement.style.transformOrigin =
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
    syncFloatingPreview();
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

      dom.pinPlaceholder?.classList.add("hidden");
      dom.removeImageBtn?.classList.remove("hidden");

      resetImagePosition();
      syncFloatingPreview();

      setTimeout(function () {
        dom.pinImage?.classList.remove("pf-animate-in");
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

    dom.pinPlaceholder?.classList.remove("hidden");
    dom.removeImageBtn?.classList.add("hidden");

    if (dom.fileInput) {
      dom.fileInput.value = "";
    }

    resetImagePosition();
    syncFloatingPreview();
  }


  function setupUpload() {
    dom.fileInput?.addEventListener("change", function (event) {
      const file = event.target.files?.[0];

      if (file) {
        handleFile(file);
      }
    });


    if (dom.dropzone) {
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
        const file = event.dataTransfer?.files?.[0];

        if (file) {
          handleFile(file);
        }
      });
    }


    dom.removeImageBtn?.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      removeImage();
    });
  }


  /* ==========================================================================
     7. IMAGE CONTROLS
     ========================================================================== */

  function setupImageControls() {
    dom.zoomSlider?.addEventListener("input", function (event) {
      state.zoom = Number(event.target.value);

      if (dom.zoomValue) {
        dom.zoomValue.textContent = `${state.zoom}%`;
      }

      applyImageTransform();
      syncFloatingPreview();
    });


    dom.posXSlider?.addEventListener("input", function (event) {
      state.posX = Number(event.target.value);

      applyImageTransform();
      syncFloatingPreview();
    });


    dom.posYSlider?.addEventListener("input", function (event) {
      state.posY = Number(event.target.value);

      applyImageTransform();
      syncFloatingPreview();
    });


    dom.resetPositionBtn?.addEventListener("click", function (event) {
      event.preventDefault();

      resetImagePosition();
    });
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
    dom.headlineInput?.addEventListener("input", function (event) {
      state.headline = event.target.value;

      renderHeadline();

      if (dom.headlineCount) {
        dom.headlineCount.textContent =
          `${state.headline.length}/60`;
      }

      syncFloatingPreview();
    });


    dom.subheadlineInput?.addEventListener("input", function (event) {
      state.subheadline = event.target.value;

      renderSubheadline();

      if (dom.subheadlineCount) {
        dom.subheadlineCount.textContent =
          `${state.subheadline.length}/80`;
      }

      syncFloatingPreview();
    });
  }


  /* ==========================================================================
     9. OVERLAY POSITION
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
    if (!dom.styleToggle || !dom.styleTogglePill) return;

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
      `translateX(${activeRect.left - parentRect.left - 4}px)`;
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

    requestAnimationFrame(updateStylePill);

    syncFloatingPreview();
  }


  function setupOverlay() {
    dom.styleToggle?.addEventListener("click", function (event) {
      const button =
        event.target.closest(".style-btn");

      if (!button) return;

      setOverlayStyle(button.dataset.style);
    });


    window.addEventListener(
      "resize",
      updateStylePill
    );
  }


  /* ==========================================================================
     10. CUSTOMIZE ACCORDION
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

    dom.customizeToggleBtn?.addEventListener("click", function () {
      setCustomizeOpen(
        !state.isCustomizingOpen
      );
    });
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
    dom.fontSelector?.addEventListener("click", function (event) {
      const chip =
        event.target.closest(".font-chip");

      if (!chip) return;

      const font =
        chip.dataset.font;

      if (!FONT_FAMILIES[font]) return;

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
      syncFloatingPreview();
    });
  }


  /* ==========================================================================
     12. COLOR
     ========================================================================== */

  function applyColor(color) {
    state.color = color;

    if (dom.pinHeadline) {
      dom.pinHeadline.style.color = color;
    }
  }


  function setActiveColor(target) {
    dom.colorSelector
      ?.querySelectorAll(".color-swatch")
      .forEach(function (item) {
        item.classList.toggle(
          "is-active",
          item === target
        );
      });
  }


  function setupColors() {
    dom.colorSelector?.addEventListener("click", function (event) {
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
      syncFloatingPreview();
    });


    dom.customColorInput?.addEventListener("input", function (event) {
      applyColor(event.target.value);

      if (dom.customColorSwatch) {
        setActiveColor(dom.customColorSwatch);
      }

      syncFloatingPreview();
    });
  }


  /* ==========================================================================
     13. CTA
     ========================================================================== */

  function getCtaText() {
    if (state.ctaType === "custom") {
      return (
        state.customCta.trim() ||
        "SHOP NOW"
      );
    }

    return state.ctaType;
  }


  function renderCTA() {
    if (!dom.pinCtaWrap || !dom.pinCtaLabel) return;

    if (state.ctaType === "none") {
      dom.pinCtaWrap.classList.add("hidden");
      return;
    }

    dom.pinCtaWrap.classList.remove("hidden");

    dom.pinCtaLabel.textContent =
      getCtaText();
  }


  function setupCTA() {
    dom.ctaSelect?.addEventListener("change", function (event) {
      state.ctaType = event.target.value;

      if (dom.ctaCustomInput) {
        dom.ctaCustomInput.classList.toggle(
          "hidden",
          state.ctaType !== "custom"
        );
      }

      renderCTA();
      syncFloatingPreview();
    });


    dom.ctaCustomInput?.addEventListener("input", function (event) {
      state.customCta =
        event.target.value;

      renderCTA();
      syncFloatingPreview();
    });
  }


  /* ==========================================================================
     14. FLOATING PREVIEW MIRROR
     ========================================================================== */

  let floatingHost = null;
  let floatingTicking = false;


  function createFloatingPreview() {
    if (floatingHost) return floatingHost;

    floatingHost =
      document.createElement("div");

    floatingHost.id =
      "pfFloatingPreview";

    floatingHost.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.appendChild(
      floatingHost
    );

    return floatingHost;
  }


  function makePreviewClone() {
    if (!dom.pinCard) return null;

    const clone =
      dom.pinCard.cloneNode(true);

    clone.id =
      "pfFloatingCard";

    clone.classList.remove(
      "group-hover:shadow-cardHover",
      "group-hover:-translate-y-1"
    );

    clone.style.transform = "none";

    return clone;
  }


  function syncFloatingPreview() {
    if (
      window.innerWidth >=
      CONFIG.mobileBreakpoint
    ) {
      return;
    }

    const host =
      createFloatingPreview();

    const clone =
      makePreviewClone();

    if (!clone) return;


    const cloneImage =
      clone.querySelector("#pinImage");

    if (cloneImage) {
      cloneImage.style.objectPosition =
        `${state.posX}% ${state.posY}%`;

      cloneImage.style.transform =
        `scale(${state.zoom / 100})`;

      cloneImage.style.transformOrigin =
        `${state.posX}% ${state.posY}%`;
    }


    const cloneCtaWrap =
      clone.querySelector("#pinCtaWrap");

    const cloneCtaLabel =
      clone.querySelector("#pinCtaLabel");

    if (cloneCtaWrap) {
      cloneCtaWrap.classList.toggle(
        "hidden",
        state.ctaType === "none"
      );
    }

    if (
      cloneCtaLabel &&
      state.ctaType !== "none"
    ) {
      cloneCtaLabel.textContent =
        getCtaText();
    }


    host.innerHTML = "";
    host.appendChild(clone);
  }


  function updateFloatingVisibility() {
    floatingTicking = false;

    if (
      window.innerWidth >=
      CONFIG.mobileBreakpoint
    ) {
      floatingHost?.classList.remove(
        "is-visible"
      );

      return;
    }

    const host =
      createFloatingPreview();

    const editorSection =
      document.querySelector(
        "main > div > section:first-child"
      );

    if (!editorSection) return;

    const rect =
      editorSection.getBoundingClientRect();

    const shouldShow =
      rect.top <
        CONFIG.mobileFloatingTop + 40 &&
      rect.bottom > 80;

    host.classList.toggle(
      "is-visible",
      shouldShow
    );
  }


  function requestFloatingUpdate() {
    if (floatingTicking) return;

    floatingTicking = true;

    requestAnimationFrame(
      updateFloatingVisibility
    );
  }


  function setupMobilePreview() {
    createFloatingPreview();

    window.addEventListener(
      "scroll",
      requestFloatingUpdate,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      function () {
        syncFloatingPreview();
        requestFloatingUpdate();
      },
      { passive: true }
    );


    if (window.visualViewport) {
      window.visualViewport.addEventListener(
        "resize",
        requestFloatingUpdate,
        { passive: true }
      );
    }


    requestFloatingUpdate();
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
        <circle cx="12" cy="12" r="9" stroke-opacity="0.3" />
        <path d="M21 12a9 9 0 0 0-9-9" />
      </svg>

      <span>Generating 1000×1500...</span>
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


  /* ==========================================================================
     17. EXPORT IMAGE LAYER

     Keep the working v0.5 background-image method.

     This is important because it avoids html2canvas stretching
     the uploaded product image.
     ========================================================================== */

  function buildExportImageLayer(clone) {
    const imageWrap =
      clone.querySelector("#pinImageWrap");

    const originalCloneImage =
      clone.querySelector("#pinImage");

    if (!imageWrap) return;


    if (originalCloneImage) {
      originalCloneImage.style.display =
        "none";
    }


    if (!state.imageSrc) {
      return;
    }


    const placeholder =
      clone.querySelector("#pinPlaceholder");

    if (placeholder) {
      placeholder.style.display =
        "none";
    }


    const imageLayer =
      document.createElement("div");

    imageLayer.className =
      "pf-export-image-layer";

    imageLayer.style.position =
      "absolute";

    imageLayer.style.inset =
      "0";

    imageLayer.style.width =
      "100%";

    imageLayer.style.height =
      "100%";

    imageLayer.style.backgroundImage =
      `url("${state.imageSrc}")`;

    imageLayer.style.backgroundRepeat =
      "no-repeat";

    imageLayer.style.backgroundPosition =
      `${state.posX}% ${state.posY}%`;

    imageLayer.style.backgroundSize =
      "cover";

    imageLayer.style.transform =
      `scale(${state.zoom / 100})`;

    imageLayer.style.transformOrigin =
      `${state.posX}% ${state.posY}%`;

    imageLayer.style.zIndex =
      "1";


    imageWrap.style.position =
      "absolute";

    imageWrap.style.inset =
      "0";

    imageWrap.style.width =
      "100%";

    imageWrap.style.height =
      "100%";

    imageWrap.style.overflow =
      "hidden";


    imageWrap.appendChild(
      imageLayer
    );
  }


  /* ==========================================================================
     18. EXPORT CTA

     v0.6:
     Do NOT hide the CTA.
     Do NOT draw CTA on canvas.

     Rebuild it as plain HTML with explicit inline styles,
     while keeping #pinCtaWrap as a normal child of #pinTextWrap.

     This means Bottom / Center / Top follow the same flex layout
     as headline and subheadline.
     ========================================================================== */

  function rebuildExportCTA(clone) {
    const ctaWrap =
      clone.querySelector("#pinCtaWrap");

    if (!ctaWrap) return;


    /*
      No CTA selected.
    */

    if (state.ctaType === "none") {
      ctaWrap.className = "";
      ctaWrap.innerHTML = "";
      ctaWrap.style.display = "none";
      return;
    }


    const text =
      getCtaText();


    /*
      Strip inherited Tailwind state from wrapper.

      IMPORTANT:
      Keep it in normal flex flow.
    */

    ctaWrap.className = "";

    ctaWrap.innerHTML = "";

    ctaWrap.style.display = "block";
    ctaWrap.style.position = "relative";

    ctaWrap.style.width = "auto";
    ctaWrap.style.height = "auto";

    ctaWrap.style.margin = "0";
    ctaWrap.style.padding = "0";

    ctaWrap.style.opacity = "1";
    ctaWrap.style.visibility = "visible";

    ctaWrap.style.zIndex = "20";


    /*
      White CTA pill.
    */

    const badge =
      document.createElement("div");

    badge.style.display =
      "inline-flex";

    badge.style.alignItems =
      "center";

    badge.style.justifyContent =
      "center";

    badge.style.boxSizing =
      "border-box";

    badge.style.width =
      "auto";

    badge.style.height =
      "56px";

    badge.style.minHeight =
      "56px";

    badge.style.padding =
      "0 26px";

    badge.style.margin =
      "8px 0 0 0";

    badge.style.gap =
      "12px";

    /*
      Solid white — deliberately no opacity.
    */

    badge.style.background =
      "#FFFFFF";

    badge.style.backgroundColor =
      "#FFFFFF";

    badge.style.border =
      "0";

    badge.style.borderRadius =
      "9999px";

    badge.style.opacity =
      "1";

    badge.style.visibility =
      "visible";

    badge.style.whiteSpace =
      "nowrap";


    /*
      Gold dot.
    */

    const dot =
      document.createElement("span");

    dot.style.display =
      "block";

    dot.style.width =
      "12px";

    dot.style.height =
      "12px";

    dot.style.minWidth =
      "12px";

    dot.style.minHeight =
      "12px";

    dot.style.flex =
      "0 0 12px";

    dot.style.margin =
      "0";

    dot.style.padding =
      "0";

    dot.style.background =
      "#B88A58";

    dot.style.backgroundColor =
      "#B88A58";

    dot.style.borderRadius =
      "9999px";

    dot.style.opacity =
      "1";


    /*
      Dark CTA label.

      Plain Arial is intentional for export reliability.
      No inherited text-white class.
    */

    const label =
      document.createElement("span");

    label.textContent =
      text;

    label.style.display =
      "block";

    label.style.margin =
      "0";

    label.style.padding =
      "0";

    label.style.color =
      "#1F2937";

    label.style.webkitTextFillColor =
      "#1F2937";

    label.style.fontFamily =
      "Arial, sans-serif";

    label.style.fontSize =
      "24px";

    label.style.fontWeight =
      "700";

    label.style.fontStyle =
      "normal";

    label.style.lineHeight =
      "1";

    label.style.letterSpacing =
      "1px";

    label.style.textDecoration =
      "none";

    label.style.textShadow =
      "none";

    label.style.opacity =
      "1";

    label.style.visibility =
      "visible";

    label.style.whiteSpace =
      "nowrap";


    badge.appendChild(
      dot
    );

    badge.appendChild(
      label
    );

    ctaWrap.appendChild(
      badge
    );
  }


  /* ==========================================================================
     19. EXPORT CARD
     ========================================================================== */

  function buildExportCard() {
    const clone =
      dom.pinCard.cloneNode(true);


    /*
      Main export card.
    */

    clone.id =
      "pinCardExport";

    clone.className =
      "relative overflow-hidden bg-white";


    clone.style.position =
      "relative";

    clone.style.width =
      `${CONFIG.exportWidth}px`;

    clone.style.height =
      `${CONFIG.exportHeight}px`;

    clone.style.minWidth =
      `${CONFIG.exportWidth}px`;

    clone.style.maxWidth =
      `${CONFIG.exportWidth}px`;

    clone.style.minHeight =
      `${CONFIG.exportHeight}px`;

    clone.style.maxHeight =
      `${CONFIG.exportHeight}px`;

    clone.style.aspectRatio =
      "auto";

    clone.style.margin =
      "0";

    clone.style.padding =
      "0";

    clone.style.border =
      "0";

    clone.style.borderRadius =
      "0";

    clone.style.boxShadow =
      "none";

    clone.style.transform =
      "none";

    clone.style.overflow =
      "hidden";


    /*
      Product image.
    */

    buildExportImageLayer(
      clone
    );


    /*
      Scrim.
    */

    const scrim =
      clone.querySelector("#pinScrim");

    if (scrim) {
      scrim.style.zIndex =
        "5";
    }


    /*
      Text wrapper.

      IMPORTANT:
      preserve the selected Bottom / Center / Top Tailwind classes.
      Do not rebuild its position manually.
    */

    const textWrap =
      clone.querySelector("#pinTextWrap");

    if (textWrap) {
      textWrap.style.zIndex =
        "10";
    }


    /*
      Headline.
    */

    const headline =
      clone.querySelector("#pinHeadline");

    if (headline) {
      headline.textContent =
        state.headline.trim() ||
        "Your Headline Here";

      headline.style.fontFamily =
        FONT_FAMILIES[state.font] ||
        FONT_FAMILIES["league-spartan"];

      headline.style.fontSize =
        "72px";

      headline.style.fontWeight =
        "700";

      headline.style.lineHeight =
        "1.08";

      headline.style.color =
        state.color;

      headline.style.webkitTextFillColor =
        state.color;

      headline.style.opacity =
        "1";
    }


    /*
      Subheadline.
    */

    const subheadline =
      clone.querySelector(
        "#pinSubheadline"
      );

    if (subheadline) {
      subheadline.textContent =
        state.subheadline.trim() ||
        "Add a subheadline for extra detail";

      subheadline.style.fontFamily =
        "'Inter', Arial, sans-serif";

      subheadline.style.fontSize =
        "34px";

      subheadline.style.fontWeight =
        "500";

      subheadline.style.lineHeight =
        "1.25";

      subheadline.style.color =
        "#FFFFFF";

      subheadline.style.webkitTextFillColor =
        "#FFFFFF";

      subheadline.style.opacity =
        "0.90";
    }


    /*
      CTA stays inside #pinTextWrap.
    */

    rebuildExportCTA(
      clone
    );


    return clone;
  }


  /* ==========================================================================
     20. SAVE PNG
     ========================================================================== */

  async function saveCanvas(
    canvas,
    filename
  ) {
    const blob =
      await new Promise(function (resolve) {
        canvas.toBlob(
          resolve,
          "image/png"
        );
      });


    if (!blob) {
      throw new Error(
        "Could not create PNG."
      );
    }


    const blobUrl =
      URL.createObjectURL(blob);


    const isIOS =
      /iPad|iPhone|iPod/.test(
        navigator.userAgent
      ) ||
      (
        navigator.platform === "MacIntel" &&
        navigator.maxTouchPoints > 1
      );


    if (isIOS) {
      const opened =
        window.open(
          blobUrl,
          "_blank"
        );


      if (!opened) {
        window.location.href =
          blobUrl;
      }


      setTimeout(function () {
        URL.revokeObjectURL(
          blobUrl
        );
      }, 60000);


      return;
    }


    const link =
      document.createElement("a");

    link.href =
      blobUrl;

    link.download =
      filename;


    document.body.appendChild(
      link
    );

    link.click();

    link.remove();


    setTimeout(function () {
      URL.revokeObjectURL(
        blobUrl
      );
    }, 5000);
  }


  /* ==========================================================================
     21. EXPORT PIN
     ========================================================================== */

  async function exportPin() {
    if (
      state.isExporting ||
      !dom.pinCard ||
      !dom.exportGhost
    ) {
      return;
    }


    state.isExporting =
      true;


    setExportButtonLoading();


    try {

      /*
        Wait for fonts.
      */

      if (document.fonts?.ready) {
        await document.fonts.ready;
      }


      /*
        Build export card.
      */

      const exportCard =
        buildExportCard();


      /*
        Prepare export host.
      */

      dom.exportGhost.innerHTML =
        "";

      dom.exportGhost.style.width =
        `${CONFIG.exportWidth}px`;

      dom.exportGhost.style.height =
        `${CONFIG.exportHeight}px`;

      dom.exportGhost.appendChild(
        exportCard
      );


      /*
        Let browser finish layout.
      */

      await new Promise(function (resolve) {
        requestAnimationFrame(function () {
          requestAnimationFrame(resolve);
        });
      });


      /*
        Safari/data URL background paint buffer.
      */

      await new Promise(function (resolve) {
        setTimeout(
          resolve,
          120
        );
      });


      if (
        typeof html2canvas ===
        "undefined"
      ) {
        throw new Error(
          "html2canvas is not loaded."
        );
      }


      /*
        Render EVERYTHING together:
        image + scrim + text + HTML CTA.
      */

      const canvas =
        await html2canvas(
          exportCard,
          {
            width:
              CONFIG.exportWidth,

            height:
              CONFIG.exportHeight,

            scale:
              1,

            backgroundColor:
              "#FFFFFF",

            useCORS:
              true,

            allowTaint:
              false,

            logging:
              false,

            scrollX:
              0,

            scrollY:
              0,

            windowWidth:
              CONFIG.exportWidth,

            windowHeight:
              CONFIG.exportHeight,
          }
        );


      console.log(
        "PinForge export:",
        canvas.width,
        "×",
        canvas.height
      );


      /*
        Save final PNG.
      */

      await saveCanvas(
        canvas,
        makeFilename()
      );


      /*
        Cleanup.
      */

      dom.exportGhost.innerHTML =
        "";


      setExportButtonSuccess();


      setTimeout(function () {
        resetExportButton();

        state.isExporting =
          false;
      }, CONFIG.successDuration);


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
     22. INITIAL STATE
     ========================================================================== */

  function setInitialState() {
    state.headline =
      dom.headlineInput?.value ||
      "";

    state.subheadline =
      dom.subheadlineInput?.value ||
      "";


    /*
      Image.
    */

    state.zoom =
      CONFIG.zoomDefault;

    state.posX =
      CONFIG.positionDefault;

    state.posY =
      CONFIG.positionDefault;

    updateImageControls();


    /*
      Overlay.
    */

    setOverlayStyle(
      "bottom"
    );


    /*
      Font.
    */

    state.font =
      "league-spartan";

    applyFont();


    /*
      Color.
    */

    applyColor(
      "#ffffff"
    );


    /*
      CTA.
    */

    state.ctaType =
      dom.ctaSelect?.value ||
      "SHOP ON ETSY";

    renderCTA();


    /*
      Customize closed.
    */

    setCustomizeOpen(
      false
    );


    /*
      Counters.
    */

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


    /*
      Mirror after state is ready.
    */

    syncFloatingPreview();


    setTimeout(
      updateStylePill,
      100
    );
  }


  /* ==========================================================================
     23. INIT
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

    setupExporter();

    setupHeader();


    /*
      Initialize real preview first.
    */

    setInitialState();


    /*
      Then initialize floating mirror.
    */

    setupMobilePreview();


    console.log(
      "PinForge v0.6 initialized ✨"
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