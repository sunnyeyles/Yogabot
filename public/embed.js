(function () {
  "use strict";

  // Configuration
  const CONFIG = {
    iframeUrl: "https://your-domain.com/iframe", // Replace with your actual domain
    minHeight: 400,
    maxHeight: 800,
    mobileHeight: 500,
    desktopHeight: 600,
    borderRadius: "12px",
    shadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
    border: "1px solid #e5e7eb",
  };

  // Create iframe container
  function createIframeContainer() {
    const container = document.createElement("div");
    container.id = "yoga-chatbot-container";
    container.style.cssText = `
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
      position: relative;
      border-radius: ${CONFIG.borderRadius};
      box-shadow: ${CONFIG.shadow};
      border: ${CONFIG.border};
      overflow: hidden;
      background: #ffffff;
    `;

    return container;
  }

  // Create iframe
  function createIframe() {
    const iframe = document.createElement("iframe");
    iframe.src = CONFIG.iframeUrl;
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      display: block;
      background: #ffffff;
    `;
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute("allowtransparency", "true");

    return iframe;
  }

  // Get responsive height
  function getResponsiveHeight() {
    const isMobile = window.innerWidth <= 768;
    const baseHeight = isMobile ? CONFIG.mobileHeight : CONFIG.desktopHeight;

    // Ensure minimum height
    return Math.max(baseHeight, CONFIG.minHeight);
  }

  // Update iframe height
  function updateIframeHeight() {
    const container = document.getElementById("yoga-chatbot-container");
    if (container) {
      const newHeight = getResponsiveHeight();
      container.style.height = `${newHeight}px`;
    }
  }

  // Handle resize events
  function handleResize() {
    updateIframeHeight();
  }

  // Initialize the chatbot
  function initChatbot() {
    // Check if container already exists
    if (document.getElementById("yoga-chatbot-container")) {
      return;
    }

    const container = createIframeContainer();
    const iframe = createIframe();

    container.appendChild(iframe);

    // Insert into the page
    const targetElement =
      document.getElementById("yoga-chatbot-embed") || document.body;
    targetElement.appendChild(container);

    // Set initial height
    updateIframeHeight();

    // Listen for resize events
    window.addEventListener("resize", handleResize);

    // Listen for messages from iframe (for height adjustments)
    window.addEventListener("message", function (event) {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "resize") {
        const newHeight = Math.min(
          Math.max(event.data.height, CONFIG.minHeight),
          CONFIG.maxHeight
        );
        container.style.height = `${newHeight}px`;
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initChatbot);
  } else {
    initChatbot();
  }

  // Expose global function for manual initialization
  window.initYogaChatbot = initChatbot;
})();
