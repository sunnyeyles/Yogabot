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

  // Add CSS styles
  function addStyles() {
    const style = document.createElement("style");
    style.textContent = `
      #yoga-chatbot-toggle {
        position: fixed;
        bottom: 20px;
        right: 16px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: #4f46e5;
        color: white;
        border: none;
        cursor: pointer;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        z-index: 999999;
      }
      
      #yoga-chatbot-toggle:hover {
        background-color: #4338ca;
        transform: scale(1.05);
      }
      
      #yoga-chatbot-label {
        position: fixed;
        bottom: 90px;
        right: 16px;
        font-size: 14px;
        font-weight: 500;
        color: #374151;
        background-color: white;
        padding: 8px 12px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border: 1px solid #e5e7eb;
        z-index: 999999;
        white-space: nowrap;
      }
      
      #yoga-chatbot-container {
        position: fixed;
        z-index: 999998;
        border-radius: 12px;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
        border: 1px solid #e5e7eb;
        background-color: white;
        transition: all 0.3s ease;
        width: 95vw;
        height: 80vh;
        max-width: 95vw;
        max-height: 80vh;
        left: 50%;
        transform: translateX(-50%);
        bottom: 20px;
      }
      
      #yoga-chatbot-close {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.1);
        color: black;
        border: none;
        cursor: pointer;
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }
      
      #yoga-chatbot-close:hover {
        background-color: rgba(0, 0, 0, 0.2);
      }
      
      #yoga-chatbot-iframe {
        width: 100%;
        height: 100%;
        border: none;
        background-color: white;
        margin: 0;
        padding: 0;
        border-radius: 12px;
      }
      
      @media (min-width: 640px) {
        #yoga-chatbot-container {
          width: 550px;
          height: 650px;
          max-width: 600px;
          max-height: 750px;
          left: auto;
          right: 16px;
          transform: none;
        }
        
        #yoga-chatbot-toggle {
          right: 64px;
        }
        
        #yoga-chatbot-label {
          right: 64px;
        }
      }
      
      .yoga-chatbot-hidden {
        opacity: 0 !important;
        pointer-events: none !important;
      }
      
      .yoga-chatbot-slide-up {
        opacity: 0;
        transform: translateY(100%);
        pointer-events: none;
      }
      
      .yoga-chatbot-slide-down {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }
    `;
    document.head.appendChild(style);
  }

  // Create toggle button
  function createToggleButton() {
    const button = document.createElement("button");
    button.id = "yoga-chatbot-toggle";
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H5V21H19V9Z" fill="currentColor"/>
      </svg>
    `;

    if (isOpen) {
      button.classList.add("yoga-chatbot-hidden");
    }

    button.addEventListener("click", toggleChatbot);
    return button;
  }

  // Create text label
  function createTextLabel() {
    const label = document.createElement("span");
    label.id = "yoga-chatbot-label";
    label.textContent = "Got questions? Ask me!";

    if (isOpen) {
      label.classList.add("yoga-chatbot-hidden");
    }

    return label;
  }

  // Create iframe
  function createIframe() {
    const iframe = document.createElement("iframe");
    iframe.id = "yoga-chatbot-iframe";
    iframe.src = CONFIG.iframeUrl;
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute("allowtransparency", "true");
    return iframe;
  }

  // Create chatbot container
  function createChatbotContainer() {
    const container = document.createElement("div");
    container.id = "yoga-chatbot-container";

    if (!isOpen) {
      container.classList.add("yoga-chatbot-slide-up");
    } else {
      container.classList.add("yoga-chatbot-slide-down");
    }

    // Add close button
    const closeButton = document.createElement("button");
    closeButton.id = "yoga-chatbot-close";
    closeButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
      </svg>
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
      if (isOpen) {
        chatbotContainer.classList.remove("yoga-chatbot-slide-up");
        chatbotContainer.classList.add("yoga-chatbot-slide-down");
      } else {
        chatbotContainer.classList.remove("yoga-chatbot-slide-down");
        chatbotContainer.classList.add("yoga-chatbot-slide-up");
      }
    }

    if (toggleButton) {
      if (isOpen) {
        toggleButton.classList.add("yoga-chatbot-hidden");
      } else {
        toggleButton.classList.remove("yoga-chatbot-hidden");
      }
    }

    const label = document.getElementById("yoga-chatbot-label");
    if (label) {
      if (isOpen) {
        label.classList.add("yoga-chatbot-hidden");
      } else {
        label.classList.remove("yoga-chatbot-hidden");
      }
    }
  }

  // Initialize the chatbot
  function initChatbot() {
    // Check if container already exists
    if (document.getElementById("yoga-chatbot-container")) {
      return;
    }

    // Add styles first
    addStyles();

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
