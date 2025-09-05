# Squarespace Embed Instructions

## Method 1: Code Block (Recommended)

1. **Add a Code Block** to your Squarespace page
2. **Paste the following code**:

```html
<!-- Yoga Chatbot Embed -->
<div id="yoga-chatbot-embed"></div>
<script src="https://your-domain.com/embed.js"></script>
```

## Method 2: Code Injection

1. Go to **Settings** → **Advanced** → **Code Injection**
2. Add to **Footer**:

```html
<!-- Yoga Chatbot Embed -->
<div id="yoga-chatbot-embed"></div>
<script src="https://your-domain.com/embed.js"></script>
```

## Method 3: Custom CSS + Code Block

1. **Add Custom CSS** (Settings → Advanced → Custom CSS):

```css
#yoga-chatbot-embed {
  margin: 20px 0;
  padding: 0;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  #yoga-chatbot-embed {
    margin: 10px 0;
  }
}
```

2. **Add Code Block** with:

```html
<div id="yoga-chatbot-embed"></div>
<script src="https://your-domain.com/embed.js"></script>
```

## Method 4: Advanced Customization

For more control over sizing and positioning:

```html
<!-- Custom container with specific dimensions -->
<div
  id="yoga-chatbot-embed"
  style="width: 100%; max-width: 500px; margin: 0 auto;"
></div>
<script src="https://your-domain.com/embed.js"></script>
```

## Responsive Sizing

The chatbot automatically adjusts:

- **Desktop**: 600px height
- **Mobile**: 500px height
- **Minimum**: 400px height
- **Maximum**: 800px height

## Styling Features

- **Border Radius**: 12px rounded corners
- **Shadow**: Subtle drop shadow
- **Border**: Light gray border
- **Responsive**: Adapts to screen size

## Troubleshooting

1. **Replace `your-domain.com`** with your actual domain
2. **Ensure HTTPS** is enabled
3. **Check browser console** for any errors
4. **Test on mobile** devices

## Customization Options

You can modify the `embed.js` file to change:

- Colors and styling
- Height settings
- Border radius
- Shadow effects
- Responsive breakpoints
