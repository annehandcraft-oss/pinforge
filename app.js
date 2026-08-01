/* ==========================================================================
   PinForge v0.2 — app.js
   FINAL STABLE BUILD
   - Position X/Y working
   - Mobile floating preview
   - iOS Safari export
   - Exact 1000 × 1500 PNG
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
    floatingTop: 82,

    successDuration: 1800,
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

    dropzone: document.getElementById("dropzone"),
    fileInput: document.getElementById("fileInput"),
    removeImageBtn: document.getElementById("removeImageBtn"),

    pinCard: document.getElementById("pinCard"),
    pinImage: document.getElementById("pinImage"),
    pinPlaceholder: document.getElementById("pinPlaceholder"),
    pinTextWrap: document.getElementById("pinTextWrap"),
    pinScrim: document.getElementById("pinScrim"),

    zoomSlider: document.getElementById("zoomSlider"),
    zoomValue: document.getElementById("zoomValue"),
    posXSlider: document.getElementById("posXSlider"),
    posYSlider: document.getElementById("posYSlider"),
    resetPositionBtn: document.getElementById("resetPositionBtn"),

    headlineInput: document.getElementById("headlineInput"),
    subheadlineInput: document.getElementById("subheadlineInput"),
    headlineCount: document.getElementById("headlineCount"),
    subheadlineCount: document.getElementById("subheadlineCount"),

    pinHeadline: document.getElementById("pinHeadline"),
    pinSubheadline: document.getElementById("pinSubheadline"),

    styleToggle: document.getElementById("styleToggle"),
    styleTogglePill: document.getElementById("styleTogglePill"),

    customizeToggleBtn: document.getElementById("customizeToggleBtn"),
    customizePanel: document.getElementById("customizePanel"),
    customizeChevron: document.getElementById("customizeChevron"),

    fontSelector: document.getElementById("fontSelector"),

    colorSelector: document.getElementById("colorSelector"),
    customColorSwatch: document.getElementById("customColorSwatch"),
    customColorInput: document.getElementById("customColorInput"),

    ctaSelect: document.getElementById("ctaSelect"),
    ctaCustomInput: document.getElementById("ctaCustomInput"),
    pinCtaWrap: document.getElementById("pinCtaWrap"),
    pinCtaLabel: document.getElementById("pinCtaLabel"),

    downloadBtn: document.getElementById("downloadBtn"),
    exportGhost: document.getElementById("exportGhost"),
  };


  /* ==========================================================================
     5. IMAGE TRANSFORM
     DO NOT CHANGE — THIS IS THE WORKING X/Y SYSTEM
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


  function applyImageTransform(image = dom.pinImage) {
    if (!image) return;

    image.style.transform =
      getImageTransform();

    image.style.transformOrigin =
      "center center";

    image.style.objectPosition =
      "50% 50%";
  }


  function updateImageControls() {
    if (dom.zoomSlider)
      dom.zoomSlider.value = state.zoom;

    if (dom.zoomValue)
      dom.zoomValue.textContent =
        `${state.zoom}%`;

    if (dom.posXSlider)
      dom.posXSlider.value = state.posX;

    if (dom.posYSlider)
      dom.posYSlider.value = state.posY;

    applyImageTransform();
  }


  function resetImagePosition() {
    state.zoom =
      CONFIG.zoomDefault;

    state.posX =
      CONFIG.positionDefault;

    state.posY =
      CONFIG.positionDefault;

    updateImageControls();
  }


  /* ==========================================================================
     6. UPLOAD
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

    const reader =
      new FileReader();

    reader.onload = function (event) {
      const src =
        event.target.result;

      if (!src) return;

      state.imageSrc = src;

      if (dom.pinImage) {
        dom.pinImage.src = src;

        dom.pinImage.classList.remove(
          "hidden"
        );

        dom.pinImage.classList.add(
          "pf-animate-in"
        );
      }

      dom.pinPlaceholder
        ?.classList.add("hidden");

      dom.removeImageBtn
        ?.classList.remove("hidden");

      resetImagePosition();

      setTimeout(function () {
        dom.pinImage
          ?.classList.remove(
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

    dom.pinPlaceholder
      ?.classList.remove("hidden");

    dom.removeImageBtn
      ?.classList.add("hidden");

    if (dom.fileInput)
      dom.fileInput.value = "";

    resetImagePosition();
  }


  function setupUpload() {
    dom.fileInput
      ?.addEventListener(
        "change",
        function (event) {
          const file =
            event.target.files?.[0];

          if (file)
            handleFile(file);
        }
      );


    if (dom.dropzone) {

      ["dragenter", "dragover"]
        .forEach(function (name) {
          dom.dropzone.addEventListener(
            name,
            function (event) {
              event.preventDefault();
              event.stopPropagation();

              dom.dropzone.classList.add(
                "is-dragover"
              );
            }
          );
        });


      ["dragleave", "drop"]
        .forEach(function (name) {
          dom.dropzone.addEventListener(
            name,
            function (event) {
              event.preventDefault();
              event.stopPropagation();

              dom.dropzone.classList.remove(
                "is-dragover"
              );
            }
          );
        });


      dom.dropzone.addEventListener(
        "drop",
        function (event) {
          const file =
            event.dataTransfer
              ?.files?.[0];

          if (file)
            handleFile(file);
        }
      );
    }


    dom.removeImageBtn
      ?.addEventListener(
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

    dom.zoomSlider
      ?.addEventListener(
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


    dom.posXSlider
      ?.addEventListener(
        "input",
        function (event) {
          state.posX =
            Number(event.target.value);

          applyImageTransform();
        }
      );


    dom.posYSlider
      ?.addEventListener(
        "input",
        function (event) {
          state.posY =
            Number(event.target.value);

          applyImageTransform();
        }
      );


    dom.resetPositionBtn
      ?.addEventListener(
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

    dom.headlineInput
      ?.addEventListener(
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


    dom.subheadlineInput
      ?.addEventListener(
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
    ) return;

    const active =
      dom.styleToggle.querySelector(
        `[data-style="${state.style}"]`
      );

    if (!active) return;

    const parent =
      dom.styleToggle
        .getBoundingClientRect();

    const button =
      active.getBoundingClientRect();

    dom.styleTogglePill.style.width =
      `${button.width}px`;

    dom.styleTogglePill.style.transform =
      `translateX(${
        button.left -
        parent.left -
        4
      }px)`;
  }


  function setOverlayStyle(style) {
    if (!OVERLAY_CLASSES[style])
      return;

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

    dom.styleToggle
      ?.addEventListener(
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
     10. CUSTOMIZE
     ========================================================================== */

  function setCustomizeOpen(open) {
    state.isCustomizingOpen = open;

    dom.customizePanel
      ?.classList.toggle(
        "is-open",
        open
      );

    dom.customizeChevron
      ?.classList.toggle(
        "is-open",
        open
      );

    dom.customizeToggleBtn
      ?.setAttribute(
        "aria-expanded",
        open
          ? "true"
          : "false"
      );
  }


  function setupCustomize() {
    setCustomizeOpen(false);

    dom.customizeToggleBtn
      ?.addEventListener(
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
      FONT_FAMILIES[
        "league-spartan"
      ];
  }


  function setupFonts() {

    dom.fontSelector
      ?.addEventListener(
        "click",
        function (event) {

          const chip =
            event.target.closest(
              ".font-chip"
            );

          if (!chip) return;

          const font =
            chip.dataset.font;

          if (!FONT_FAMILIES[font])
            return;

          state.font = font;

          dom.fontSelector
            .querySelectorAll(
              ".font-chip"
            )
            .forEach(
              function (item) {
                item.classList.toggle(
                  "is-active",
                  item === chip
                );
              }
            );

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

    dom.colorSelector
      ?.addEventListener(
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


    dom.customColorInput
      ?.addEventListener(
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

  function renderCTA() {

    if (
      !dom.pinCtaWrap ||
      !dom.pinCtaLabel
    ) return;


    if (state.ctaType === "none") {

      dom.pinCtaWrap
        .classList.add("hidden");

      return;
    }


    dom.pinCtaWrap
      .classList.remove("hidden");


    let text =
      state.ctaType;


    if (
      state.ctaType === "custom"
    ) {

      text =
        state.customCta.trim() ||
        "SHOP NOW";
    }


    dom.pinCtaLabel.textContent =
      text;
  }


  function setupCTA() {

    dom.ctaSelect
      ?.addEventListener(
        "change",
        function (event) {

          state.ctaType =
            event.target.value;


          if (
            dom.ctaCustomInput
          ) {

            dom.ctaCustomInput
              .classList.toggle(
                "hidden",
                state.ctaType !==
                  "custom"
              );
          }


          renderCTA();
        }
      );


    dom.ctaCustomInput
      ?.addEventListener(
        "input",
        function (event) {

          state.customCta =
            event.target.value;

          renderCTA();
        }
      );
  }


  /* ==========================================================================
     14. MOBILE FLOATING PREVIEW — FIXED
     ========================================================================== */

  let floatingTicking = false;


  function updateMobilePreview() {
    floatingTicking = false;

    if (!dom.pinCard) return;


    /*
      Never float on desktop.
    */

    if (
      window.innerWidth >=
      CONFIG.mobileBreakpoint
    ) {

      dom.pinCard.classList.remove(
        "pf-mobile-floating"
      );

      return;
    }


    /*
      IMPORTANT:

      We no longer calculate from the editor section.

      Instead, we calculate from the ORIGINAL
      preview's parent section.

      Once the normal preview has scrolled above
      the header, the card becomes fixed.

      Because position:fixed removes it from normal
      layout, we use the preview SECTION itself as
      our stable reference.
    */

    const previewSection =
      dom.pinCard.closest("section");

    if (!previewSection) return;


    const rect =
      previewSection
        .getBoundingClientRect();


    /*
      Start floating when the preview section
      has moved above the visible header.

      Keep it floating while user is further
      down the page.
    */

    const shouldFloat =
      rect.bottom <
      CONFIG.floatingTop + 120;


    dom.pinCard.classList.toggle(
      "pf-mobile-floating",
      shouldFloat
    );
  }


  function requestMobilePreviewUpdate() {

    if (floatingTicking) return;

    floatingTicking = true;

    requestAnimationFrame(
      updateMobilePreview
    );
  }


  function setupMobilePreview() {

    window.addEventListener(
      "scroll",
      requestMobilePreviewUpdate,
      { passive: true }
    );


    window.addEventListener(
      "resize",
      requestMobilePreviewUpdate,
      { passive: true }
    );


    if (window.visualViewport) {

      window.visualViewport
        .addEventListener(
          "resize",
          requestMobilePreviewUpdate,
          { passive: true }
        );
    }


    requestMobilePreviewUpdate();
  }


  /* ==========================================================================
     15. HEADER
     ========================================================================== */

  function setupHeader() {

    window.addEventListener(
      "scroll",
      function () {

        dom.siteHeader
          ?.classList.toggle(
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
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      )
      .substring(0, 50);


    return (
      `${name}-1000x1500.png`
    );
  }


  function setExportLoading() {

    if (!dom.downloadBtn) return;


    dom.downloadBtn.disabled =
      true;


    dom.downloadBtn.innerHTML = `
      <svg
        class="pf-spin"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        stroke-width="2">

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
        Generating...
      </span>
    `;
  }


  function setExportSuccess() {

    if (!dom.downloadBtn) return;


    dom.downloadBtn
      .classList.add(
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
        stroke-linejoin="round">

        <path
          d="M5 13l4 4L19 7"
        />
      </svg>

      <span>
        Pin Ready!
      </span>
    `;
  }


  function resetExportButton() {

    if (!dom.downloadBtn) return;


    dom.downloadBtn.disabled =
      false;


    dom.downloadBtn
      .classList.remove(
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
        stroke-linejoin="round">

        <path
          d="M12 16V4M12 16l-4-4M12 16l4-4"
        />

        <path
          d="M4 20h16"
        />
      </svg>

      <span>
        Download PNG
      </span>
    `;
  }


  function waitForImage(image) {

    if (
      !image ||
      !image.src
    ) {

      return Promise.resolve();
    }


    if (
      image.complete &&
      image.naturalWidth > 0
    ) {

      if (image.decode) {

        return image
          .decode()
          .catch(
            function () {}
          );
      }


      return Promise.resolve();
    }


    return new Promise(
      function (resolve) {

        image.onload =
          function () {
            resolve();
          };


        image.onerror =
          function () {
            resolve();
          };
      }
    );
  }


  function canvasToBlob(canvas) {

    return new Promise(
      function (resolve, reject) {

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

          "image/png"
        );
      }
    );
  }


  /* ==========================================================================
     17. EXPORT
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

    setExportLoading();


    try {

      /*
        Wait for fonts.
      */

      if (document.fonts?.ready) {
        await document.fonts.ready;
      }


      /*
        Clone preview.
      */

      const clone =
        dom.pinCard.cloneNode(true);


      clone.classList.remove(
        "pf-mobile-floating"
      );


      clone.id =
        "pinCardExport";


      /*
        Exact export box.
      */

      Object.assign(
        clone.style,
        {
          position: "relative",
          top: "auto",
          right: "auto",
          bottom: "auto",
          left: "auto",

          width:
            `${CONFIG.exportWidth}px`,

          height:
            `${CONFIG.exportHeight}px`,

          minWidth:
            `${CONFIG.exportWidth}px`,

          maxWidth:
            `${CONFIG.exportWidth}px`,

          aspectRatio:
            "2 / 3",

          margin: "0",

          borderRadius: "0",

          boxShadow: "none",

          transform: "none",

          transition: "none",
        }
      );


      /*
        IMAGE

        Same geometry as live preview:
        120% x 120%
        -10% offset
        object-fit cover
        SAME transform.
      */

      const cloneImage =
        clone.querySelector(
          "#pinImage"
        );


      if (cloneImage) {

        Object.assign(
          cloneImage.style,
          {
            position: "absolute",

            width: "120%",
            height: "120%",

            left: "-10%",
            top: "-10%",

            maxWidth: "none",

            objectFit: "cover",
            objectPosition: "50% 50%",

            transform:
              getImageTransform(),

            transformOrigin:
              "center center",

            transition: "none",
          }
        );
      }


      /*
        Text sizes for 1000px width.
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
        CTA — explicitly rebuild its current state.
      */

      const cloneCtaWrap =
        clone.querySelector(
          "#pinCtaWrap"
        );


      const cloneCtaLabel =
        clone.querySelector(
          "#pinCtaLabel"
        );


      let ctaText =
        state.ctaType;


      if (
        state.ctaType === "custom"
      ) {

        ctaText =
          state.customCta.trim() ||
          "SHOP NOW";
      }


      if (cloneCtaWrap) {

        if (
          state.ctaType === "none"
        ) {

          cloneCtaWrap.style.display =
            "none";

        } else {

          cloneCtaWrap.style.display =
            "block";

          cloneCtaWrap
            .classList.remove(
              "hidden"
            );
        }
      }


      if (
        cloneCtaLabel &&
        state.ctaType !== "none"
      ) {

        cloneCtaLabel.textContent =
          ctaText;

        cloneCtaLabel.style.fontSize =
          "24px";

        cloneCtaLabel.style.lineHeight =
          "1";
      }


      if (cloneCtaWrap) {

        const badge =
          cloneCtaWrap.querySelector(
            ".inline-flex"
          );


        if (badge) {

          badge.style.padding =
            "14px 24px";

          badge.style.marginTop =
            "12px";

          badge.style.gap =
            "10px";
        }


        const dot =
          cloneCtaWrap.querySelector(
            ".rounded-full.bg-accent"
          );


        if (dot) {

          dot.style.width =
            "12px";

          dot.style.height =
            "12px";

          dot.style.minWidth =
            "12px";
        }
      }


      /*
        Add clone to export host.
      */

      dom.exportGhost.innerHTML =
        "";


      Object.assign(
        dom.exportGhost.style,
        {
          width:
            `${CONFIG.exportWidth}px`,

          height:
            `${CONFIG.exportHeight}px`,
        }
      );


      dom.exportGhost
        .appendChild(clone);


      /*
        Wait for image.
      */

      await waitForImage(
        cloneImage
      );


      /*
        Allow layout to settle.
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


      if (
        typeof html2canvas ===
        "undefined"
      ) {

        throw new Error(
          "html2canvas library missing."
        );
      }


      /*
        Render.
      */

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

            allowTaint: false,

            backgroundColor:
              "#ffffff",

            logging: false,

            scrollX: 0,
            scrollY: 0,

            windowWidth:
              CONFIG.exportWidth,

            windowHeight:
              CONFIG.exportHeight,
          }
        );


      /*
        Sanity check.
      */

      if (
        canvas.width !==
          CONFIG.exportWidth ||
        canvas.height !==
          CONFIG.exportHeight
      ) {

        throw new Error(
          `Wrong export size: ${canvas.width}x${canvas.height}`
        );
      }


      /*
        Convert to Blob.

        This is significantly better than a gigantic
        data URL on iPhone Safari.
      */

      const blob =
        await canvasToBlob(canvas);


      const filename =
        makeFilename();


      const blobUrl =
        URL.createObjectURL(blob);


      /*
        DOWNLOAD STRATEGY

        Try normal download FIRST on every browser,
        including modern iOS Safari.

        Modern Safari supports download for blob URLs
        much better than the old window.open approach.

        If iOS ignores download, the blob URL is opened
        in the same tab after a short delay.
      */

      const link =
        document.createElement("a");


      link.href =
        blobUrl;


      link.download =
        filename;


      link.style.display =
        "none";


      document.body
        .appendChild(link);


      link.click();


      link.remove();


      /*
        iOS fallback.

        Do NOT use window.open after async work:
        Safari blocks it as a popup.

        Same-tab navigation is not popup-blocked.
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


      if (isIOS) {

        /*
          Give Safari a moment to honor the
          download attribute.

          If it doesn't, navigating to the PNG
          still lets the user long-press / Save Image.
        */

        setTimeout(
          function () {

            /*
              We intentionally DON'T revoke
              the blob before this.
            */

            window.location.href =
              blobUrl;

          },
          450
        );

      } else {

        setTimeout(
          function () {
            URL.revokeObjectURL(
              blobUrl
            );
          },
          10000
        );
      }


      dom.exportGhost.innerHTML =
        "";


      setExportSuccess();


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

    dom.downloadBtn
      ?.addEventListener(
        "click",
        exportPin
      );
  }


  /* ==========================================================================
     18. INITIAL STATE
     ========================================================================== */

  function setInitialState() {

    state.headline =
      dom.headlineInput
        ?.value || "";


    state.subheadline =
      dom.subheadlineInput
        ?.value || "";


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
      dom.ctaSelect
        ?.value ||
      "SHOP ON ETSY";


    state.customCta =
      dom.ctaCustomInput
        ?.value || "";


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


    requestMobilePreviewUpdate();
  }


  /* ==========================================================================
     19. INIT
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
      "PinForge FINAL stable build initialized ✨"
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