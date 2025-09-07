(function () {
  "use strict";

  // Configuration
  const CONFIG = {
    iframeUrl: "https://yogabot.vercel.app/iframe",
  };

  let isOpen = false;
  let iframe = null;
  let toggleButton = null;
  let chatbotContainer = null;

  // Create toggle button
  function createToggleButton() {
    const button = document.createElement("button");
    button.id = "yoga-chatbot-toggle";
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H5V21H19V9Z" fill="currentColor"/>
      </svg>
    `;

    // Apply Tailwind CSS classes for styling
    button.className = `
      fixed bottom-5 right-4 sm:right-16 z-[999999] 
      w-15 h-15 rounded-full bg-indigo-600 text-white 
      border-none cursor-pointer shadow-lg 
      flex items-center justify-center 
      transition-all duration-300 hover:bg-indigo-700
      ${isOpen ? "opacity-0 pointer-events-none" : "opacity-100"}
    `;

    button.addEventListener("click", toggleChatbot);
    return button;
  }

  // Create text label
  function createTextLabel() {
    const label = document.createElement("span");
    label.id = "yoga-chatbot-label";
    label.textContent = "Got questions? Ask me!";
    label.className = `
      fixed bottom-20 right-4 sm:right-16 z-[999999]
      text-sm font-medium text-gray-700 bg-white 
      px-3 py-2 rounded-lg shadow-md border border-gray-200
      ${isOpen ? "opacity-0 pointer-events-none" : "opacity-100"}
    `;
    return label;
  }

  // Create iframe
  function createIframe() {
    const iframe = document.createElement("iframe");
    iframe.src = CONFIG.iframeUrl;
    iframe.className = "w-full h-full border-0 bg-white m-0 p-0";
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute("allowtransparency", "true");
    return iframe;
  }

  // Create chatbot container
  function createChatbotContainer() {
    const container = document.createElement("div");
    container.id = "yoga-chatbot-container";
    container.className = `
      fixed z-[999998] rounded-xl shadow-2xl border border-gray-200 bg-white 
      transition-all duration-300
      w-[95vw] h-[80vh] max-w-[95vw] max-h-[80vh] 
      left-1/2 transform -translate-x-1/2 bottom-5 
      sm:w-[550px] sm:h-[650px] sm:max-w-[600px] sm:max-h-[750px] 
      sm:left-auto sm:right-4 sm:transform-none sm:-translate-x-0
      ${
        isOpen
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-full pointer-events-none"
      }
    `;

    // Add close button
    const closeButton = document.createElement("button");
    closeButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
      </svg>
    `;
    closeButton.className = `
      absolute top-2 right-2 w-8 h-8 rounded-full bg-black/10 text-black 
      border-none cursor-pointer z-[999999] 
      flex items-center justify-center 
      transition-all duration-200 hover:bg-black/20
    `;
    closeButton.addEventListener("click", toggleChatbot);

    container.appendChild(closeButton);
    container.appendChild(createIframe());

    return container;
  }

  // Toggle chatbot visibility
  function toggleChatbot() {
    isOpen = !isOpen;

    if (chatbotContainer) {
      chatbotContainer.className = `
        fixed z-[999998] rounded-xl shadow-2xl border border-gray-200 bg-white 
        transition-all duration-300
        w-[95vw] h-[80vh] max-w-[95vw] max-h-[80vh] 
        left-1/2 transform -translate-x-1/2 bottom-5 
        sm:w-[550px] sm:h-[650px] sm:max-w-[600px] sm:max-h-[750px] 
        sm:left-auto sm:right-4 sm:transform-none sm:-translate-x-0
        ${
          isOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-full pointer-events-none"
        }
      `;
    }

    if (toggleButton) {
      toggleButton.className = `
        fixed bottom-5 right-4 sm:right-16 z-[999999] 
        w-15 h-15 rounded-full bg-indigo-600 text-white 
        border-none cursor-pointer shadow-lg 
        flex items-center justify-center 
        transition-all duration-300 hover:bg-indigo-700
        ${isOpen ? "opacity-0 pointer-events-none" : "opacity-100"}
      `;
    }

    if (document.getElementById("yoga-chatbot-label")) {
      const label = document.getElementById("yoga-chatbot-label");
      label.className = `
        fixed bottom-20 right-4 sm:right-16 z-[999999]
        text-sm font-medium text-gray-700 bg-white 
        px-3 py-2 rounded-lg shadow-md border border-gray-200
        ${isOpen ? "opacity-0 pointer-events-none" : "opacity-100"}
      `;
    }
  }

  // Initialize the chatbot
  function initChatbot() {
    // Check if container already exists
    if (document.getElementById("yoga-chatbot-container")) {
      return;
    }

    // Create and append elements
    toggleButton = createToggleButton();
    const textLabel = createTextLabel();
    chatbotContainer = createChatbotContainer();

    // Insert into the page
    const targetElement =
      document.getElementById("yoga-chatbot-embed") || document.body;
    targetElement.appendChild(toggleButton);
    targetElement.appendChild(textLabel);
    targetElement.appendChild(chatbotContainer);
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initChatbot);
  } else {
    initChatbot();
  }

  // Expose global functions
  window.initYogaChatbot = initChatbot;
  window.toggleYogaChatbot = toggleChatbot;
})();
