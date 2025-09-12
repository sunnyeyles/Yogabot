# Yoga Chatbot Embed Instructions

## Quick Setup

### 1. Basic Embed Code

Add this code to your website where you want the chatbot to appear:

```html
<!-- Add this div where you want the chatbot -->
<div id="yoga-chatbot-embed"></div>

<!-- Add this script before closing </body> tag -->
<script src="https://yogabot2.vercel.app/embed.js"></script>
```

### 1.1. Versioned Embed Code (Recommended for Production)

For production websites, we recommend using the versioned embed script for better stability:

```html
<!-- Add this div where you want the chatbot -->
<div id="yoga-chatbot-embed"></div>

<!-- Use versioned script for stability -->
<script src="https://yogabot2.vercel.app/embed-v1.js"></script>
```

**Benefits of versioned scripts:**

- Guaranteed backward compatibility
- Won't break when we update the main embed script
- More stable for production websites

### 2. Custom Container

If you want to place the chatbot in a specific container:

```html
<div class="my-chatbot-container">
  <div id="yoga-chatbot-embed"></div>
</div>
<script src="https://yogabot2.vercel.app/embed.js"></script>
```

## Configuration Options

### Customizing the Chatbot

You can customize the chatbot appearance by modifying the configuration:

```html
<script>
  // Override default configuration
  window.YogaChatbotConfig = {
    iframeUrl: "https://yogabot2.vercel.app/iframe",
    minHeight: 400,
    maxHeight: 800,
    mobileHeight: 500,
    desktopHeight: 600,
    borderRadius: "12px",
    shadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
    border: "1px solid #e5e7eb",
  };
</script>
<script src="https://yogabot2.vercel.app/embed.js"></script>
```

### Manual Initialization

If you need to initialize the chatbot manually:

```html
<div id="yoga-chatbot-embed"></div>
<script src="https://yogabot2.vercel.app/embed.js"></script>
<script>
  // Initialize when ready
  window.initYogaChatbot();
</script>
```

## Platform-Specific Instructions

### Squarespace

1. Go to your Squarespace site editor
2. Add a Code Block where you want the chatbot
3. Paste the embed code
4. Save and publish

### WordPress

1. Add a Custom HTML block
2. Paste the embed code
3. Update the page

### Wix

1. Add an Embed element
2. Choose "Custom Code"
3. Paste the embed code

### Shopify

1. Go to Online Store > Themes > Actions > Edit code
2. Add the embed code to your desired template
3. Save changes

## Features

- **Responsive Design**: Automatically adjusts for mobile and desktop
- **Customizable Styling**: Easy to modify colors, borders, and shadows
- **Auto-resize**: Chatbot height adjusts based on content
- **Cross-origin Safe**: Secure iframe communication
- **Lazy Loading**: Optimized for performance

## Troubleshooting

### Chatbot Not Appearing

1. Check that the script URL is correct
2. Ensure the div with id "yoga-chatbot-embed" exists
3. Check browser console for errors
4. Verify the chatbot service is running: https://yogabot2.vercel.app/api/health

### Styling Issues

1. Make sure your site's CSS isn't conflicting
2. Try adding `!important` to override styles
3. Check if your site has strict CSP policies

### Mobile Issues

1. Ensure viewport meta tag is present
2. Check if your site has responsive design
3. Test on actual mobile devices

### Service Issues

If the chatbot stops working:

1. **Check Service Status**: Visit https://yogabot2.vercel.app/api/health
2. **Try Versioned Script**: Switch to `embed-v1.js` for stability
3. **Clear Browser Cache**: Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
4. **Check Console Errors**: Open browser developer tools and look for JavaScript errors

### Emergency Fallback

If the chatbot is completely down, you can temporarily remove the embed script without breaking your website. The chatbot will simply not appear until the service is restored.

## Support

For technical support or customization requests, contact: info@marrickvilleyoga.com.au
