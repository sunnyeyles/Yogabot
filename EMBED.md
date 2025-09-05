# Basic Embed Code

```html
<!-- Yoga Chatbot Iframe Embed -->
<script>
  (function () {
    // Configuration
    const CHATBOT_URL = "https://yogabot.vercel.app";
    const CONTAINER_ID = "yoga-chatbot-container";
    const IFRAME_ID = "yoga-chatbot-iframe";

    // Responsive sizing function
    function createResponsiveIframe() {
      // Remove existing iframe if it exists
      const existingContainer = document.getElementById(CONTAINER_ID);
      if (existingContainer) {
        existingContainer.remove();
      }

      // Create container
      const container = document.createElement("div");
      container.id = CONTAINER_ID;
      container.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 350px;
      height: 600px;
      max-width: calc(100vw - 40px);
      max-height: calc(100vh - 40px);
      z-index: 9999;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      transition: all 0.3s ease;
      background: white;
    `;

      // Create iframe
      const iframe = document.createElement("iframe");
      iframe.id = IFRAME_ID;
      iframe.src = CHATBOT_URL;
      iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    `;
      iframe.setAttribute("allow", "microphone");
      iframe.setAttribute(
        "sandbox",
        "allow-scripts allow-same-origin allow-forms"
      );

      // Add iframe to container
      container.appendChild(iframe);

      // Add to page
      document.body.appendChild(container);

      // Mobile responsiveness
      function handleResize() {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
          container.style.cssText = `
          position: fixed;
          bottom: 0;
          right: 0;
          left: 0;
          top: 0;
          width: 100vw;
          height: 100vh;
          max-width: 100vw;
          max-height: 100vh;
          z-index: 9999;
          border-radius: 0;
          box-shadow: none;
          overflow: hidden;
          transition: all 0.3s ease;
          background: white;
        `;
        } else {
          container.style.cssText = `
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 350px;
          height: 600px;
          max-width: calc(100vw - 40px);
          max-height: calc(100vh - 40px);
          z-index: 9999;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          transition: all 0.3s ease;
          background: white;
        `;
        }
      }

      // Listen for resize events
      window.addEventListener("resize", handleResize);
      handleResize(); // Initial call

      // Close button functionality
      const closeButton = document.createElement("button");
      closeButton.innerHTML = "×";
      closeButton.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      width: 30px;
      height: 30px;
      border: none;
      background: rgba(0, 0, 0, 0.5);
      color: white;
      border-radius: 50%;
      cursor: pointer;
      font-size: 18px;
      font-weight: bold;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
      closeButton.onclick = () => container.remove();
      container.appendChild(closeButton);
    }

    // Initialize when DOM is ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", createResponsiveIframe);
    } else {
      createResponsiveIframe();
    }
  })();
</script>
```

## Toggle Button Version

If you prefer a toggle button instead of always-visible iframe:

```html
<!-- Yoga Chatbot Toggle Button -->
<script>
  (function () {
    const CHATBOT_URL = "https://yogabot.vercel.app/";
    const CONTAINER_ID = "yoga-chatbot-container";
    const BUTTON_ID = "yoga-chatbot-button";
    let isOpen = false;

    function createToggleButton() {
      const existingContainer = document.getElementById(CONTAINER_ID);
      const existingButton = document.getElementById(BUTTON_ID);
      if (existingContainer) existingContainer.remove();
      if (existingButton) existingButton.remove();

      const button = document.createElement("button");
      button.id = BUTTON_ID;
      button.innerHTML = "💬 Chat";
      button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: none;
      background: #007bff;
      color: white;
      font-size: 12px;
      font-weight: bold;
      cursor: pointer;
      z-index: 9998;
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
      transition: all 0.3s ease;
    `;

      button.onclick = toggleChatbot;
      document.body.appendChild(button);
    }

    function toggleChatbot() {
      const container = document.getElementById(CONTAINER_ID);

      if (isOpen && container) {
        container.remove();
        isOpen = false;
      } else {
        createChatbotContainer();
        isOpen = true;
      }
    }

    function createChatbotContainer() {
      const container = document.createElement("div");
      container.id = CONTAINER_ID;
      container.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 20px;
      width: 350px;
      height: 600px;
      max-width: calc(100vw - 40px);
      max-height: calc(100vh - 100px);
      z-index: 9999;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      background: white;
    `;

      const iframe = document.createElement("iframe");
      iframe.src = CHATBOT_URL;
      iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    `;
      iframe.setAttribute("allow", "microphone");
      iframe.setAttribute(
        "sandbox",
        "allow-scripts allow-same-origin allow-forms"
      );

      container.appendChild(iframe);
      document.body.appendChild(container);

      // Mobile responsiveness
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        container.style.cssText = `
        position: fixed;
        bottom: 0;
        right: 0;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        max-width: 100vw;
        max-height: 100vh;
        z-index: 9999;
        border-radius: 0;
        box-shadow: none;
        overflow: hidden;
        background: white;
      `;
      }
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", createToggleButton);
    } else {
      createToggleButton();
    }
  })();
</script>
```

## Page-Specific Embed

To embed only on specific pages, wrap the code in a condition:

```html
<script>
  (function () {
    // Only show on specific pages
    const allowedPages = ["/"];
    const currentPath = window.location.pathname;

    if (allowedPages.includes(currentPath)) {
      // ... your embed code here ...
    }
  })();
</script>
```
