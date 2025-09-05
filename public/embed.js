(function () {
  "use strict";

  // Configuration
  const CONFIG = {
    iframeUrl: "https://yogabot.vercel.app/iframe",
  };

  // Create iframe
  function createIframe() {
    const iframe = document.createElement("iframe");
    iframe.src = CONFIG.iframeUrl;
    iframe.className = "w-full h-screen border-0 block bg-white m-0 p-0";
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute("allowtransparency", "true");

    return iframe;
  }

  // Initialize the chatbot
  function initChatbot() {
    // Check if container already exists
    if (document.getElementById("yoga-chatbot-embed")) {
      return;
    }

    const iframe = createIframe();

    // Insert into the page
    const targetElement =
      document.getElementById("yoga-chatbot-embed") || document.body;
    targetElement.appendChild(iframe);
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
