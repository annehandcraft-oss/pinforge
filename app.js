/* ==========================================================================
   PinForge v0.2 — app.js
   Stable Build
   Matches current index.html + style.css
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
    posXDefault: 50,
    posYDefault: 50,

    maxFileSize: 10 * 1024 * 1024,

    headlineFallback: "Your Headline Here",
    subheadlineFallback: "Add a subheadline for extra detail",

    successDuration: 1600,
  };


  /* ==========================================================================
     2. FONT MAP
     ========================================================================== */

  const FONT_FAMILIES = {
    "league-spartan": "'League Spartan', sans-serif",
    "inter": "'Inter', sans-serif",
    "playfair-display": "'Playfair Display', serif",
    "dm-serif-display": "'DM Serif Display', serif",
    "poppins": "'Poppins', sans-serif",
    "caveat": "'Caveat', cursive",
  };


  /* ==========================================================================
     3. DOM
     ========================================================================== */

  const dom = {
    siteHeader: document.getElementById("siteHeader"),

    dropzone: document.getElementById("dropzone"),
    fileInput: document.getElementById("fileInput"),
    removeImageBtn: document.getElementById("removeImageBtn"),

    pinImage: document.getElementById("pinImage"),
    pinPlaceholder: document.getElementById("pinPlaceholder"),

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

    pinTextWrap: document.getElementById("pinTextWrap"),
    pinScrim: document.getElementById("pinScrim"),

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
    downloadIcon: document.getElementById("downloadIcon"),
    downloadLabel: document.getElementById("downloadLabel"),

    pinCard: document.getElementById("pinCard"),
    exportGhost: document.getElementById("exportGhost"),
  };


  /* ==========================================================================
     4. STATE
     ========================================================================== */

  const state = {
    imageSrc: null,

    zoom: CONFIG.zoomDefault,
    posX: CONFIG.posXDefault,
    posY: CONFIG.posYDefault,

    headline: "",
    subheadline: "",

    style: "bottom",

    font: "league-spartan",
    color: "#ffffff",

    ctaType: "SHOP ON ETSY",
    customCta: "",

    customizeOpen: false,
    exporting: false,
  };


  /* ==========================================================================
     5. IMAGE POSITIONING
     ========================================================================== */

  function applyImageTransform() {
    if (!dom.pinImage) return;

    const zoomScale = state.zoom / 100;

    /*
      IMPORTANT:

      object-position handles X/Y positioning.

      transform ONLY handles zoom.

      Do NOT translate the image here.
      Combining translate + object-position was the reason Y positioning
      became unpredictable in previous builds.
    */

    dom.pinImage.style.width = "100%";
    dom.pinImage.style.height = "100%";
    dom.pinImage.style.objectFit = "cover";

    dom.pinImage.style.objectPosition =
      `${state.posX}% ${state.posY}%`;

    dom.pinImage.style.transform =
      `scale(${zoomScale})`;

    dom.pinImage.style.transformOrigin =
      "center center";
  }


  function syncImageControls() {
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
    state.posX = CONFIG.posXDefault;
    state.posY = CONFIG.posYDefault;

    syncImageControls();
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

    if (file.size > CONFIG.maxFileSize) {
      alert("Image must be smaller than 10MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
      const result = event.target.result;

      if (!result) return;

      state.imageSrc = result;

      resetImagePosition();

      if (dom.pinImage) {
        dom.pinImage.onload = function () {
          applyImageTransform();
        };

        dom.pinImage.src = result;
        dom.pinImage.classList.remove("hidden");
        dom.pinImage.classList.add("pf-animate-in");
      }

      if (dom.pinPlaceholder) {
        dom.pinPlaceholder.classList.add("hidden");
      }

      if (dom.removeImageBtn) {
        dom.removeImageBtn.classList.remove("hidden");
      }

      setTimeout(function () {
        dom.pinImage?.classList.remove(
          "pf-animate-in"
        );
      }, 500);
    };

    reader.readAsDataURL(file);
  }


  function clearImage() {
    state.imageSrc = null;

    if (dom.fileInput) {
      dom.fileInput.value = "";
    }

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

        clearImage();
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

        /*
          This directly changes object-position Y.
          0   = top
          50  = center
          100 = bottom
        */

        applyImageTransform();
      }
    );


    dom.resetPositionBtn?.addEventListener(
      "click",
      function () {
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
      CONFIG.headlineFallback;
  }


  function renderSubheadline() {
    if (!dom.pinSubheadline) return;

    dom.pinSubheadline.textContent =
      state.subheadline.trim() ||
      CONFIG.subheadlineFallback;
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
     9. OVERLAY POSITION
     ========================================================================== */

  function applyOverlayPosition() {
    if (
      !dom.pinTextWrap ||
      !dom.pinScrim
    ) {
      return;
    }


    if (state.style === "bottom") {

      dom.pinTextWrap.className =
        "absolute inset-x-0 bottom-0 p-[6%] flex flex-col gap-2 text-left items-start";

      dom.pinScrim.className =
        "absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-black/70 via-black/25 to-transparent pointer-events-none";

    }


    if (state.style === "center") {

      dom.pinTextWrap.className =
        "absolute inset-x-0 top-1/2 -translate-y-1/2 p-[6%] flex flex-col gap-2 text-center items-center";

      dom.pinScrim.className =
        "absolute inset-0 bg-black/35 pointer-events-none";

    }


    if (state.style === "top") {

      dom.pinTextWrap.className =
        "absolute inset-x-0 top-0 p-[6%] flex flex-col gap-2 text-left items-start";

      dom.pinScrim.className =
        "absolute inset-x-0 top-0 h-[46%] bg-gradient-to-b from-black/70 via-black/25 to-transparent pointer-events-none";

    }


    dom.styleToggle
      ?.querySelectorAll(".style-btn")
      .forEach(function (button) {

        button.classList.toggle(
          "is-active",
          button.dataset.style ===
            state.style
        );

      });


    requestAnimationFrame(
      updateStylePill
    );
  }


  function updateStylePill() {
    if (
      !dom.styleToggle ||
      !dom.styleTogglePill
    ) {
      return;
    }

    const button =
      dom.styleToggle.querySelector(
        `[data-style="${state.style}"]`
      );

    if (!button) return;

    const parentRect =
      dom.styleToggle.getBoundingClientRect();

    const buttonRect =
      button.getBoundingClientRect();

    dom.styleTogglePill.style.width =
      `${buttonRect.width}px`;

    dom.styleTogglePill.style.transform =
      `translateX(${
        buttonRect.left -
        parentRect.left -
        4
      }px)`;
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

        const style =
          button.dataset.style;

        if (
          ![
            "bottom",
            "center",
            "top",
          ].includes(style)
        ) {
          return;
        }

        state.style = style;

        applyOverlayPosition();
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

  function setCustomize(open) {
    state.customizeOpen = open;

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
    setCustomize(false);

    dom.customizeToggleBtn?.addEventListener(
      "click",
      function () {
        setCustomize(
          !state.customizeOpen
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
          .querySelectorAll(
            ".font-chip"
          )
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


  function setActiveColor(element) {
    dom.colorSelector
      ?.querySelectorAll(
        ".color-swatch"
      )
      .forEach(function (swatch) {

        swatch.classList.toggle(
          "is-active",
          swatch === element
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

  function renderCTA() {
    if (
      !dom.pinCtaWrap ||
      !dom.pinCtaLabel
    ) {
      return;
    }


    if (state.ctaType === "none") {
      dom.pinCtaWrap.classList.add(
        "hidden"
      );

      return;
    }


    dom.pinCtaWrap.classList.remove(
      "hidden"
    );


    let text = state.ctaType;


    if (state.ctaType === "custom") {
      text =
        state.customCta.trim() ||
        "SHOP NOW";
    }


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
     14. EXPORT
     EXACT 1000 × 1500
     ========================================================================== */

  async function exportPin() {

    if (
      state.exporting ||
      !dom.pinCard ||
      !dom.exportGhost
    ) {
      return;
    }


    state.exporting = true;


    setDownloadState(
      "loading"
    );


    try {

      if (
        document.fonts &&
        document.fonts.ready
      ) {
        await document.fonts.ready;
      }


      /*
        IMPORTANT EXPORT STRATEGY

        Instead of stretching the responsive preview itself,
        we create a 1000 × 1500 clone and explicitly rebuild
        the dimensions of the important children.

        This prevents the uploaded product image from becoming
        squashed/gepeng.
      */


      const clone =
        dom.pinCard.cloneNode(true);


      clone.id =
        "pinCardExport";


      clone.style.width =
        "1000px";

      clone.style.height =
        "1500px";

      clone.style.minWidth =
        "1000px";

      clone.style.maxWidth =
        "1000px";

      clone.style.aspectRatio =
        "2 / 3";

      clone.style.position =
        "relative";

      clone.style.overflow =
        "hidden";

      clone.style.borderRadius =
        "0";

      clone.style.transform =
        "none";

      clone.style.boxShadow =
        "none";


      /*
        IMAGE
      */

      const exportImageWrap =
        clone.querySelector(
          "#pinImageWrap"
        );


      if (exportImageWrap) {
        exportImageWrap.style.position =
          "absolute";

        exportImageWrap.style.inset =
          "0";

        exportImageWrap.style.width =
          "1000px";

        exportImageWrap.style.height =
          "1500px";

        exportImageWrap.style.overflow =
          "hidden";
      }


      const exportImage =
        clone.querySelector(
          "#pinImage"
        );


      if (exportImage) {

        exportImage.style.position =
          "absolute";

        exportImage.style.inset =
          "0";

        exportImage.style.width =
          "100%";

        exportImage.style.height =
          "100%";

        /*
          THIS is what prevents distortion.
        */

        exportImage.style.objectFit =
          "cover";

        exportImage.style.objectPosition =
          `${state.posX}% ${state.posY}%`;

        exportImage.style.transform =
          `scale(${state.zoom / 100})`;

        exportImage.style.transformOrigin =
          "center center";

        exportImage.style.maxWidth =
          "none";

        exportImage.style.display =
          state.imageSrc
            ? "block"
            : "none";
      }


      /*
        SCRIM
      */

      const exportScrim =
        clone.querySelector(
          "#pinScrim"
        );


      if (exportScrim) {

        exportScrim.style.zIndex =
          "5";

      }


      /*
        TEXT WRAPPER
      */

      const exportText =
        clone.querySelector(
          "#pinTextWrap"
        );


      if (exportText) {

        exportText.style.zIndex =
          "10";

        /*
          Preview uses 6% padding.
          6% of 1000 = 60px.
        */

        exportText.style.padding =
          "60px";

        exportText.style.gap =
          "18px";

      }


      /*
        HEADLINE
      */

      const exportHeadline =
        clone.querySelector(
          "#pinHeadline"
        );


      if (exportHeadline) {

        exportHeadline.style.fontFamily =
          FONT_FAMILIES[state.font];

        exportHeadline.style.color =
          state.color;

        exportHeadline.style.fontSize =
          "72px";

        exportHeadline.style.lineHeight =
          "1.08";

        exportHeadline.style.fontWeight =
          "700";

      }


      /*
        SUBHEADLINE
      */

      const exportSub =
        clone.querySelector(
          "#pinSubheadline"
        );


      if (exportSub) {

        exportSub.style.fontSize =
          "34px";

        exportSub.style.lineHeight =
          "1.3";

      }


      /*
        CTA

        Explicitly rebuild CTA dimensions so Tailwind styles
        don't disappear during html2canvas export.
      */

      const exportCtaWrap =
        clone.querySelector(
          "#pinCtaWrap"
        );


      const exportCtaLabel =
        clone.querySelector(
          "#pinCtaLabel"
        );


      if (exportCtaWrap) {

        exportCtaWrap.style.display =
          state.ctaType === "none"
            ? "none"
            : "block";

        exportCtaWrap.style.marginTop =
          "8px";

      }


      if (
        exportCtaWrap &&
        state.ctaType !== "none"
      ) {

        const badge =
          exportCtaWrap.querySelector(
            "span"
          );


        if (badge) {

          badge.style.display =
            "inline-flex";

          badge.style.alignItems =
            "center";

          badge.style.width =
            "fit-content";

          badge.style.background =
            "rgba(255,255,255,0.95)";

          badge.style.borderRadius =
            "9999px";

          badge.style.padding =
            "14px 24px";

          badge.style.gap =
            "10px";

        }

      }


      if (exportCtaLabel) {

        let ctaText =
          state.ctaType;


        if (
          state.ctaType ===
          "custom"
        ) {

          ctaText =
            state.customCta.trim() ||
            "SHOP NOW";

        }


        exportCtaLabel.textContent =
          ctaText;

        exportCtaLabel.style.display =
          "inline";

        exportCtaLabel.style.fontSize =
          "22px";

        exportCtaLabel.style.lineHeight =
          "1";

        exportCtaLabel.style.fontWeight =
          "700";

        exportCtaLabel.style.color =
          "#1F2937";

        exportCtaLabel.style.letterSpacing =
          "0.04em";

      }


      /*
        EXPORT HOST
      */

      dom.exportGhost.innerHTML =
        "";

      dom.exportGhost.style.width =
        "1000px";

      dom.exportGhost.style.height =
        "1500px";

      dom.exportGhost.appendChild(
        clone
      );


      /*
        Give browser one frame to calculate
        the new 1000×1500 layout.
      */

      await new Promise(function (resolve) {

        requestAnimationFrame(function () {

          requestAnimationFrame(
            resolve
          );

        });

      });


      /*
        Ensure cloned image is decoded before canvas capture.
      */

      if (
        exportImage &&
        exportImage.src
      ) {

        try {

          if (exportImage.decode) {
            await exportImage.decode();
          }

        } catch (_) {
          // Safe fallback.
        }

      }


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
            width: 1000,
            height: 1500,

            scale: 1,

            useCORS: true,

            allowTaint: true,

            backgroundColor:
              "#ffffff",

            logging: false,

            scrollX: 0,
            scrollY: 0,
          }
        );


      dom.exportGhost.innerHTML =
        "";


      /*
        Safety check.
      */

      console.log(
        "Export size:",
        canvas.width,
        canvas.height
      );


      /*
        FILENAME
      */

      let slug =
        state.headline.trim() ||
        "pinforge-pin";


      slug = slug
        .toLowerCase()
        .replace(
          /[^a-z0-9]+/g,
          "-"
        )
        .replace(
          /^-+|-+$/g,
          ""
        )
        .substring(
          0,
          45
        );


      const filename =
        `${slug}-1000x1500.png`;


      /*
        DOWNLOAD

        Use Blob first because it is substantially
        lighter than giant base64 data URLs.
      */

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

        downloadDataUrl(
          canvas.toDataURL(
            "image/png"
          ),
          filename
        );

      } else {

        await downloadBlob(
          blob,
          filename
        );

      }


      setDownloadState(
        "success"
      );


      setTimeout(
        function () {

          setDownloadState(
            "normal"
          );

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


      setDownloadState(
        "error"
      );


      setTimeout(
        function () {

          setDownloadState(
            "normal"
          );

        },
        1800
      );


    } finally {

      state.exporting =
        false;

    }

  }


  /* ==========================================================================
     15. DOWNLOAD HELPERS
     ========================================================================== */

  function isIOS() {

    return (
      /iPad|iPhone|iPod/.test(
        navigator.userAgent
      ) ||
      (
        navigator.platform ===
          "MacIntel" &&
        navigator.maxTouchPoints >
          1
      )
    );

  }


  async function downloadBlob(
    blob,
    filename
  ) {

    const url =
      URL.createObjectURL(blob);


    /*
      iPhone/iPad Safari often ignores
      <a download> for blob URLs.

      Opening the generated PNG is more reliable.
      User can then Save Image / Save to Files.
    */

    if (isIOS()) {

      const newWindow =
        window.open(
          url,
          "_blank"
        );


      if (!newWindow) {

        window.location.href =
          url;

      }


      /*
        Don't revoke immediately.
        Safari still needs the URL.
      */

      setTimeout(
        function () {

          URL.revokeObjectURL(
            url
          );

        },
        60000
      );


      return;

    }


    const link =
      document.createElement(
        "a"
      );


    link.href =
      url;

    link.download =
      filename;


    document.body.appendChild(
      link
    );


    link.click();


    link.remove();


    setTimeout(
      function () {

        URL.revokeObjectURL(
          url
        );

      },
      5000
    );

  }


  function downloadDataUrl(
    dataUrl,
    filename
  ) {

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


  /* ==========================================================================
     16. DOWNLOAD BUTTON UI
     ========================================================================== */

  function setDownloadState(mode) {

    if (!dom.downloadBtn) {
      return;
    }


    if (mode === "loading") {

      dom.downloadBtn.disabled =
        true;

      dom.downloadBtn.innerHTML = `
        <svg class="pf-spin"
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
            stroke-opacity="0.25"
          />
          <path
            d="M21 12a9 9 0 0 0-9-9"
          />
        </svg>

        <span>
          Generating 1000×1500...
        </span>
      `;

      return;

    }


    if (mode === "success") {

      dom.downloadBtn.disabled =
        false;

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
          stroke-linejoin="round">
          <path d="M5 13l4 4L19 7"/>
        </svg>

        <span>Pin Ready!</span>
      `;

      return;

    }


    if (mode === "error") {

      dom.downloadBtn.disabled =
        false;

      dom.downloadBtn.innerHTML =
        "<span>Export Failed — Retry</span>";

      return;

    }


    dom.downloadBtn.disabled =
      false;

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
        stroke-linejoin="round">

        <path d="M12 16V4M12 16l-4-4M12 16l4-4"/>
        <path d="M4 20h16"/>

      </svg>

      <span>Download PNG</span>
    `;

  }


  /* ==========================================================================
     17. HEADER
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
      {
        passive: true,
      }
    );

  }


  /* ==========================================================================
     18. INITIAL STATE
     ========================================================================== */

  function setInitialState() {

    resetImagePosition();


    state.style =
      "bottom";

    applyOverlayPosition();


    state.font =
      "league-spartan";

    applyFont();


    state.color =
      "#ffffff";

    applyColor(
      "#ffffff"
    );


    state.ctaType =
      "SHOP ON ETSY";


    if (dom.ctaSelect) {

      dom.ctaSelect.value =
        "SHOP ON ETSY";

    }


    renderCTA();


    setCustomize(false);


    renderHeadline();

    renderSubheadline();


    if (dom.headlineCount) {

      dom.headlineCount.textContent =
        "0/60";

    }


    if (dom.subheadlineCount) {

      dom.subheadlineCount.textContent =
        "0/80";

    }


    setTimeout(
      updateStylePill,
      100
    );

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

    setupHeader();


    dom.downloadBtn?.addEventListener(
      "click",
      exportPin
    );


    setInitialState();


    console.log(
      "PinForge stable build initialized ✨"
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