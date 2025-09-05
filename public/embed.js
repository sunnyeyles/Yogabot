(function () {
  "use strict";

  // Configuration
  const CONFIG = {
    iframeUrl: "https://yogabot.vercel.app/iframe",
    minHeight: 400,
    maxHeight: 800,
    mobileHeight: 500,
    desktopHeight: 600,
    borderRadius: "12px",
    shadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
    border: "1px solid #e5e7eb",
    isOpen: false,
  };

  // Create toggle button
  function createToggleButton() {
    const button = document.createElement("button");
    button.id = "yoga-chatbot-toggle";
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
      </svg>
    `;
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #4F46E5;
      color: white;
      border: none;
      cursor: pointer;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    `;

    button.addEventListener("click", toggleChatbot);
    return button;
  }

  // Create iframe container
  function createIframeContainer() {
    const container = document.createElement("div");
    container.id = "yoga-chatbot-container";
    container.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 350px;
      height: 500px;
      z-index: 9999;
      border-radius: ${CONFIG.borderRadius};
      box-shadow: ${CONFIG.shadow};
      border: ${CONFIG.border};
      overflow: hidden;
      background: #ffffff;
      display: none;
      transition: all 0.3s ease;
      transform: translateY(100%);
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
      margin: 0;
      padding: 0;
      position: relative;
    `;
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute("allowtransparency", "true");
    iframe.setAttribute("loading", "lazy");

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

  // Toggle chatbot visibility
  function toggleChatbot() {
    const container = document.getElementById("yoga-chatbot-container");
    const button = document.getElementById("yoga-chatbot-toggle");

    if (CONFIG.isOpen) {
      container.style.display = "none";
      container.style.transform = "translateY(100%)";
      button.style.transform = "rotate(0deg)";
      CONFIG.isOpen = false;
    } else {
      container.style.display = "block";
      setTimeout(() => {
        container.style.transform = "translateY(0)";
      }, 10);
      button.style.transform = "rotate(45deg)";
      CONFIG.isOpen = true;
    }
  }

  // Initialize the chatbot
  function initChatbot() {
    // Check if container already exists
    if (document.getElementById("yoga-chatbot-container")) {
      return;
    }

    const container = createIframeContainer();
    const iframe = createIframe();
    const toggleButton = createToggleButton();

    container.appendChild(iframe);

    // Insert into the page
    document.body.appendChild(container);
    document.body.appendChild(toggleButton);

    // Set initial height
    updateIframeHeight();

    // Listen for resize events
    window.addEventListener("resize", handleResize);

    // Listen for messages from iframe (for height adjustments)
    window.addEventListener("message", function (event) {
      // Check if the message is from our iframe
      if (event.origin !== new URL(CONFIG.iframeUrl).origin) return;

      if (event.data.type === "resize") {
        const newHeight = Math.min(
          Math.max(event.data.height, CONFIG.minHeight),
          CONFIG.maxHeight
        );
        container.style.height = `${newHeight}px`;
      }
    });

    // Handle iframe load
    iframe.addEventListener("load", function () {
      // Send initial height request to iframe
      iframe.contentWindow.postMessage(
        { type: "getHeight" },
        new URL(CONFIG.iframeUrl).origin
      );
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

  // Expose configuration for customization
  window.YogaChatbotConfig = CONFIG;
})();
