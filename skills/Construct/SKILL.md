---
name: construct
# prettier-ignore
description: Create iCUE widgets with proper structure, styling, and documentation references for Xeneon Edge.
---

# Skill: Create iCUE Widget

When the user asks to create an iCUE widget, follow this comprehensive workflow.

## Phase 1: Requirements Gathering

Ask only if not provided:

1. **Widget purpose** - What data is shown and from which API/source?
2. **Target devices** - Which devices? (`dashboard_lcd`, `pump_lcd`, `keyboard`)
3. **Update interval** - How often should data refresh? Offline behavior?
4. **Customization** - What should be configurable from iCUE?

## Phase 2: Research & Design

### 2.1 Read Documentation

Read documentation from `.documentation/` folder:

- `CUEDEVS-Widget Creation-*.pdf` - Basic structure
- `CUEDEVS-Widget Meta Parameters-*.pdf` - All property types
- `CUEDEVS-JavaScript Expressions in Meta Parameters-*.pdf` - Dynamic expressions
- `CUEDEVS-Using Local Storage With Widgets-*.pdf` - Data persistence

### 2.2 Device Specifications

| Device                        | Resolution                                                                                                                                                                                                                                                                                                                                      |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dashboard_lcd` (Xeneon Edge) | 2536x696 (horizontal), varies S/M/L/XL  * **Xeneon Edge (dashboard_lcd)**: S / M / L / XL (horizontal & vertical):<br/>S, horizontal: 840×344<br/>S, vertical: 696×416<br/>M,  horizontal: 840×696<br/>M, vertical: 696×840<br/>L,  horizontal: 1688×696<br/>L, vertical: 696×1688<br/>XL, horizontal: 2536×696<br/>XL, vertical: 696×2536<br/> |
| `pump_lcd`                    | 480x480 (circular mask - square)                                                                                                                                                                                                                                                                                                                              |
| `keyboard`                    | 320x170                                                                                                                                                                                                                                                                                                                                         |

### 2.3 Layout Classes (Choose One)

- **WideStrip**: Horizontal layout, 1 primary + up to 2 secondary elements
- **TallStack**: Vertical layout, 1 primary + up to 3 stacked elements
- **SquareTile**: Compact layout, 1 value OR 1 icon + 1 label

### 2.4 Design Specifications

```
Widget Name: [Name]
Layout Class: [WideStrip | TallStack | SquareTile]
Target Devices: [dashboard_lcd | pump_lcd | keyboard]

Properties:
  - [propertyName]: [type] - [description] - [default]

Property Groups:
  - [Widget Name]: [feature properties...]
  - Widget Personalization: [backgroundImage, glassBlur, bgBrightness, textColor, accentColor, backgroundColor, transparency]

States Required:
  - Loading state
  - Empty state (if applicable)
  - Error/offline state (if API-driven)
```

### 2.5 Tools Available

- There will always be these available tools in the root directory folder called /tools/ for all iCUE installations, I have added them for reference in the .tools folder in our repository so we can ensure good integration. Do not include these tools with any widget package.

## Phase 3: Widget Implementation

### 3.1 Required Deliverables

Generate complete widget file set:

1. `/<WidgetName>.html` - Main widget file
2. `/styles/<WidgetName>.css` - Stylesheet
3. `/<WidgetName>_translation.json` - All `tr('...')` keys used
4. `/images/<widgetname>.svg` - Icon (single-color, transparent background)

### 3.2 HTML Structure Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>tr('[Widget Name]')</title>
  <link rel="icon" type="image/svg+xml" href="images/[widgetname].svg">
  <link rel="stylesheet" type="text/css" href="tools/media_editor/MediaEditor.css">
  <script type="text/javascript" src="tools/media_editor/MediaEditor.js"></script>

  <!-- Device restrictions - USE JSON FORMAT (CRITICAL) -->
  <meta name="x-icue-restrictions"
        data-restrictions='[
          { "device": "dashboard_lcd" }
        ]'>

  <!-- Multiple devices example:
  <meta name="x-icue-restrictions"
        data-restrictions='[
          { "device": "dashboard_lcd" },
          { "device": "pump_lcd" },
          { "device": "keyboard" }
        ]'>
  -->

  <!-- Optional: Feature filtering -->
  <!-- { "device": "keyboard", "features": ["sensor-screen"] } -->

  <!-- Enable interactivity if widget has scrolling, clicking, or touch -->
  <!-- <meta name="x-icue-interactive"> -->

  <!-- Optional: Widget grouping -->
  <!-- <meta name="x-icue-widget-group" content="tr('[Group Name]')"> -->
  <!-- <meta name="x-icue-widget-preview" content="resources/[Preview].png"> -->

  <!-- Optional: External module -->
  <!-- <meta name="x-icue-module" content="modules/[Module].mjs"> -->

  <!-- Feature Properties -->
  <!-- Add widget-specific properties here -->

  <!-- Widget Personalization (MUST BE LAST GROUP) -->
  <meta name="x-icue-property" content="backgroundImage" data-label="tr('Background Image')" data-type="media-selector" data-filters="['*.png','*.jpg','*.jpeg','*.webp']">
  <meta name="x-icue-property" content="glassBlur" data-label="tr('Glass Blur')" data-type="slider" data-default="0" data-min="0" data-max="40" data-step="1">
  <meta name="x-icue-property" content="bgBrightness" data-label="tr('Background Brightness')" data-type="slider" data-default="100" data-min="10" data-max="150" data-step="5">
  <meta name="x-icue-property" content="textColor" data-label="tr('Text Color')" data-type="color" data-default="'#ffffff'">
  <meta name="x-icue-property" content="accentColor" data-label="tr('Accent Color')" data-type="color" data-default="'#ffffff'">
  <meta name="x-icue-property" content="backgroundColor" data-label="tr('Background')" data-type="color" data-default="'#000000'">
  <meta name="x-icue-property" content="transparency" data-label="tr('Transparency')" data-type="slider" data-default="100" data-min="0" data-max="100" data-step="1">

  <!-- Property grouping - Widget Personalization MUST be last -->
  <script id="x-icue-groups" type="application/json">
  [
    { "title": "tr('[Widget Name]')", "properties": [...] },
    { "title": "tr('Widget Personalization')", "properties": ["backgroundImage", "glassBlur", "bgBrightness", "textColor", "accentColor", "backgroundColor", "transparency"] }
  ]
  </script>

  <link rel="stylesheet" type="text/css" href="styles/[WidgetName].css">
</head>
<body>
  <div class="widget-root">
    <div class="widget-background" aria-hidden="true">
      <div id="media-background"></div>
    </div>
    <!-- Widget content -->
    <div class="loading-state">Loading...</div>
    <div class="error-state" style="display:none;">Unable to load data</div>
    <div class="empty-state" style="display:none;">No data available</div>
    <div class="content" style="display:none;">
      <!-- Main content here -->
    </div>
  </div>

  <script>
    // iCUE API binding
    icueEvents = {
      'onDataUpdated': onIcueDataUpdated,
      'onICUEInitialized': onIcueInitialized
      // 'onUpdateRequested': onUpdateRequested  // For refresh button support
    };

    let languageCode = 'en';
    const mediaBackgroundElement = document.getElementById('media-background');
    const mediaBackgroundComponent = createMediaBackgroundComponent(mediaBackgroundElement);

    function resolveMediaPath(value) {
      if (!value) return '';
      if (typeof value === 'string') return value;
      if (value.pathToAsset) return value.pathToAsset;
      if (value.path) return value.path;
      if (value.value) return value.value;
      return '';
    }

    function normalizeMediaConfig(rawMedia) {
      const mediaPath = resolveMediaPath(rawMedia);
      if (!mediaPath) return null;

      const base = (rawMedia && typeof rawMedia === 'object') ? rawMedia : {};
      return {
        pathToAsset: base.pathToAsset || mediaPath,
        path: base.path || mediaPath,
        baseSizeX: Number(base.baseSizeX) || 0,
        baseSizeY: Number(base.baseSizeY) || 0,
        scale: Number.isFinite(Number(base.scale)) ? Number(base.scale) : 1,
        positionX: Number(base.positionX) || 0,
        positionY: Number(base.positionY) || 0,
        angle: Number(base.angle) || 0
      };
    }

    function createMediaBackgroundComponent(container) {
      if (!container) {
        return { clear: function() {}, loadMedia: function() {} };
      }

      if (typeof MediaEditor === 'function') {
        return new MediaEditor({
          container: container,
          onMediaLoaded: function() {
            container.style.display = 'block';
          },
          onMediaError: function(error) {
            console.error('Media background error:', error);
          }
        });
      }

      console.warn('MediaEditor unavailable. Falling back to background-image CSS.');
      return {
        clear: function() {
          container.style.backgroundImage = '';
          container.style.display = 'none';
        },
        loadMedia: function(config) {
          const mediaPath = resolveMediaPath(config);
          if (!mediaPath) {
            container.style.backgroundImage = '';
            container.style.display = 'none';
            return;
          }
          container.style.backgroundImage = "url('" + mediaPath + "')";
          container.style.backgroundRepeat = 'no-repeat';
          container.style.backgroundPosition = 'center';
          container.style.backgroundSize = 'cover';
          container.style.display = 'block';
        }
      };
    }

    function applyStyles() {
      const root = document.documentElement;

      // Apply transparency
      const t = Number(typeof transparency !== 'undefined' ? transparency : 100);
      root.style.setProperty('--transparency', Number.isFinite(t) ? t / 100 : 1);

      // Apply colors (use consistent variable names between JS and CSS)
      root.style.setProperty('--text-color', typeof textColor !== 'undefined' ? textColor : '#ffffff');
      root.style.setProperty('--accent-color', typeof accentColor !== 'undefined' ? accentColor : '#ffffff');
      root.style.setProperty('--bg-color', typeof backgroundColor !== 'undefined' ? backgroundColor : '#000000');

      const blur = Number(typeof glassBlur !== 'undefined' ? glassBlur : 0);
      const brightness = Number(typeof bgBrightness !== 'undefined' ? bgBrightness : 100);
      root.style.setProperty('--bg-blur', (Number.isFinite(blur) ? blur : 0) + 'px');
      root.style.setProperty('--bg-brightness', (Number.isFinite(brightness) ? brightness : 100) + '%');

      const mediaConfig = normalizeMediaConfig(typeof backgroundImage !== 'undefined' ? backgroundImage : undefined);
      if (!mediaConfig) {
        mediaBackgroundComponent.clear();
      } else {
        mediaBackgroundComponent.loadMedia(mediaConfig);
      }
    }

    function showState(state) {
      const states = ['loading-state', 'error-state', 'empty-state', 'content'];
      states.forEach(s => {
        const el = document.querySelector('.' + s);
        if (el) el.style.display = s === state ? '' : 'none';
      });
    }

    function updateWidget() {
      // Widget-specific update logic
      showState('content');
    }

    function onIcueDataUpdated() {
      applyStyles();
      updateWidget();
    }

    function onIcueInitialized() {
      if (typeof iCUE !== 'undefined' && iCUE.iCUELanguage) {
        languageCode = iCUE.iCUELanguage;
      }
      onIcueDataUpdated();
    }

    // Initial render for browser testing
    if (typeof iCUE_initialized !== 'undefined' && iCUE_initialized) {
      onIcueInitialized();
    } else {
      onIcueDataUpdated();
    }
  </script>
</body>
</html>
```

### 3.3 Translation JSON Template

```json
{
  "[Widget Name]": "[Widget Name]",
  "Widget Personalization": "Widget Personalization",
  "Background Image": "Background Image",
  "Glass Blur": "Glass Blur",
  "Background Brightness": "Background Brightness",
  "Text Color": "Text Color",
  "Accent Color": "Accent Color",
  "Background": "Background",
  "Transparency": "Transparency"
}
```

### 3.4 CSS Template with Typography Rules

```css
:root {
  --text-color: #ffffff;
  --accent-color: #ffffff;
  --bg-color: #000000;
  --transparency: 1;

  /* Typography - base font = shortestEdge / 12 */
  --base-font: calc(min(100vw, 100vh) / 12);
  --secondary-font: calc(var(--base-font) * 0.6);
  --label-font: calc(var(--base-font) * 0.45);
}

html { overflow: hidden; }

body {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: OpenSans, Arial, sans-serif;
  background: transparent;
}

.widget-root {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: transparent;
  color: var(--text-color);
  /* Safe areas based on layout class */
}

.widget-background {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

#media-background {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  filter: blur(var(--bg-blur, 0px)) brightness(var(--bg-brightness, 100%));
  z-index: 0;
}

.content,
.loading-state,
.error-state,
.empty-state {
  position: relative;
  z-index: 1;
}

.content {
  background: rgba(0, 0, 0, var(--transparency));
}

/* WideStrip safe areas: 5% horizontal, 10% vertical */
.widget-root.wide-strip {
  padding: 10% 5%;
}

/* TallStack safe areas: 10% all sides */
.widget-root.tall-stack {
  padding: 10%;
}

/* SquareTile safe areas: 12% all sides */
.widget-root.square-tile {
  padding: 12%;
}

/* Typography - never below 12px equivalent */
.primary-text {
  font-size: clamp(12px, var(--base-font), 72px);
}

.secondary-text {
  font-size: clamp(10px, var(--secondary-font), 48px);
}

.label-text {
  font-size: clamp(8px, var(--label-font), 36px);
}

/* States */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: var(--secondary-font);
  opacity: 0.7;
}
```

### 3.5 Available Property Types

```html
<!-- Slider (numeric, integers only, 0-100 for percentages) -->
<meta name="x-icue-property" content="brightness" data-label="tr('Brightness')" data-type="slider" data-default="50" data-min="0" data-max="100" data-step="1">
<!-- Slider with unit label -->
<meta name="x-icue-property" content="duration" data-label="tr('Duration')" data-type="slider" data-default="1000" data-min="100" data-max="5000" data-step="100" unit-label="ms">
<!-- Slider enum (text values) -->
<meta name="x-icue-property" content="speed" data-label="tr('Speed')" data-type="slider-enum" data-values="['Slow','Medium','Fast']" data-default="'Medium'">
<!-- Tab buttons -->
<meta name="x-icue-property" content="mode" data-label="tr('Mode')" data-type="tab-buttons" data-values="['Option1','Option2','Option3']" data-default="'Option1'">
<!-- Combobox -->
<meta name="x-icue-property" content="selection" data-label="tr('Selection')" data-type="combobox" data-values="['A','B','C']" data-default="'A'">
<!-- Search combobox (dynamic values from module) -->
<meta name="x-icue-property" content="location" data-label="tr('Location')" data-type="search-combobox" data-values="ModuleName.getOptions" data-default="ModuleName.getDefault" data-placeholder="tr('Search...')">
<!-- Switch (boolean) -->
<meta name="x-icue-property" content="enabled" data-label="tr('Enable Feature')" data-type="switch" data-default="true">
<!-- Color picker -->
<meta name="x-icue-property" content="color" data-label="tr('Color')" data-type="color" data-default="'#ff0000'">
<!-- Text field -->
<meta name="x-icue-property" content="message" data-label="tr('Message')" data-type="textfield" data-default="'Hello'">
<!-- Sensors combobox -->
<meta name="x-icue-property" content="sensor1" data-label="tr('Sensor')" data-type="sensors-combobox" data-default="''">
<!-- Timezone (using iCUE built-in) -->
<meta name="x-icue-property" content="timeZone" data-label="tr('Time Zone')" data-type="combobox" data-values="iCUE.allTimeZones()" data-default="iCUE.defaultTimeZone()">
```

### 3.6 External API

- Research what external API for the data user requested.
- Check API license and terms of usage.
- If possible - use free API. Make sure that all references and requirements for the usage are followed and the user is notified.
- If there is no free API for the data - suggest user to enter API key in iCUE as a parameter and have users sign up for their own api key.

### 3.7 Graphics Requirements

- Icons must be **single-color SVGs, or PNGs** with transparent background
- For illustrations and icons - try to find them online first, avoid Wikimedia or other known
- In case if there is no free images available - generate own versions.
- Prefer high-contrast solid shapes
- Store in `/images/` directory

## Phase 4: Preflight Check (MANDATORY)

Before final output, verify ALL of the following:

`Widget Personalization` group is **exactly last** in x-icue-groups

Only standard personalization properties: `textColor`, `accentColor`, `backgroundColor`, `transparency`

`data-restrictions` uses **JSON format** (not `data-device-types`)

`x-icue-interactive` exists if any scrolling/clicking/touch is required

All CSS variables used in stylesheet are set by JavaScript

`x-icue-groups` is valid JSON with no empty groups

All `tr('...')` keys exist in translation JSON

All file paths match exact case (case-sensitive)

No `&` in labels (use `&amp;` if needed)

Property `content` names are unique, letters and digits only

Sliders use integers only (percentages are 0-100)

Loading, empty, and error states are implemented (if API-driven)

Typography scales properly (never below 12px)

Safe areas respected for layout class

## Phase 6: Summary Generation

Generate summary in this format:

```markdown
## Widget: [Name]

### Description
[1-2 sentence description of what the widget does]

### Layout Class
[WideStrip | TallStack | SquareTile]

### Capabilities
- [Capability 1]
- [Capability 2]
- ...

### Supported Devices
| Device | Resolution |
|--------|------------|
| [device] | [resolution] |

### Configurable Properties
| Property | Type | Description | Default |
|----------|------|-------------|---------|
| [name] | [type] | [description] | [default] |

### States Handled
- Loading: [description]
- Empty: [description]
- Error: [description]
- Content: [description]

### Files Generated
| File | Path |
|------|------|
| Widget | `[WidgetName].html` |
| Stylesheet | `styles/[WidgetName].css` |
| Translation | `[WidgetName]_translation.json` |
| Icon | `images/[widgetname].svg` |

### Testing Notes
[Any special testing considerations]
```

### Phase 5 Code Rules - 

## 5.1 Media Selector Requirements (iCUE Widgets)

These rules apply to any widget that supports iCUE’s **media-selector** property for backgrounds or other user-chosen media.

### 1) You must apply **all** iCUE transform parameters

When iCUE returns a selected media asset, you must use the full media object — not only the file path. Your rendering layer must support:

* `pathToAsset` *(string)* — actual media file path
* `baseSizeX` *(number)* — original media width basis used by iCUE
* `baseSizeY` *(number)* — original media height basis used by iCUE
* `scale` *(number)* — user-selected scale factor
* `positionX` *(number)* — user-selected X offset
* `positionY` *(number)* — user-selected Y offset
* `angle` *(number)* — user-selected rotation

**Hard requirement:** If you ignore scale/rotation/position/base size, the widget can appear “broken” even though a media file was selected.

---

### 2) You must render a dedicated full-size background layer behind content

If the media is intended as a background, your layout must include a dedicated background layer that:

* Fills the widget: `width: 100%`, `height: 100%`
* Is pinned to the widget bounds: `position: absolute` and `inset: 0` (or `top/left/right/bottom: 0`)
* Crops correctly: `overflow: hidden`
* Sits behind content: background `z-index` lower than main UI

Recommended structure (background is the lowest DOM layer):

```html
<div class="widget-background">
  <div id="media-background"></div>
</div>
```

---

### 3) You must use Corsair’s MediaEditor helper when available

To avoid re-implementing transform math and media element handling, use Corsair’s MediaEditor module:

```html
<script type="text/javascript" src="tools/media_editor/MediaEditor.js"></script>
<link rel="stylesheet" href="tools/media_editor/MediaEditor.css">
```

**Requirement:** Your widget must rely on the `tools/media_editor/...` folder installed by iCUE (relative paths must resolve at runtime).

---

### 4) The media mount point must exist and be reachable at init time

`#media-background` must exist in the HTML and be accessible when your script initializes.

**Hard requirement:** Do not create the mount point dynamically after initialization.

---

### 5) Do not hide the media mount with `display:none`

**Requirement:** `#media-background` must never be hidden using `display: none`.

**Why:** iCUE/Qt may suspend and resume widgets (e.g., page swipe) without re-triggering media “loaded” callbacks. If the mount is `display:none`, the background can remain invisible until a manual re-render happens.

**Required approach:** Keep the mount in the layout tree and toggle visibility with a class using `opacity` and/or `visibility`.

Required CSS pattern:

```css
#media-background {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.2s linear;
}

#media-background.has-media {
  opacity: 1;
  visibility: visible;
}
```

---

### 6) Initialize MediaEditor early, exactly once per mount point

Initialize MediaEditor near the beginning of your script:

* Create **exactly one** MediaEditor instance per mount point
* Provide `onMediaError` to surface failures during debugging
* Provide `onMediaLoaded` (recommended) to mark the mount visible

Expected behavior:

* `onMediaLoaded` → add `.has-media` on `#media-background`
* `clear()` / no media → remove `.has-media`

---

### 7) Update media inside `onIcueDataUpdated`

When iCUE pushes updated properties, your widget must:

* Clear the media if the property becomes undefined/empty
* Load media using the **full media object** when it exists

Required logic:

* If `backgroundMedia` is undefined → call `mediaBackgroundComponent.clear()` and remove `.has-media`
* Else → call `mediaBackgroundComponent.loadMedia({ ...backgroundMedia })`

**Hard requirement:** Loading only `pathToAsset` is not sufficient.

---

### 8) Meta property name must match update code exactly

Whatever your meta parameter name is, your update code must reference the exact same key in the incoming iCUE data object.

Example:

* Meta: `content="backgroundMedia"`
* Code must read: `data.backgroundMedia` (exact match)

---

### 9) Background CSS must be explicit and not rely on browser defaults

Do not assume inserted media will naturally scale/cover. Ensure:

* Parent container fills widget
* `#media-background` fills parent
* No conflicting CSS that prevents sizing (e.g., missing height, fixed sizes, or layout constraints that collapse the container)

---

### 10) Provide predictable fallbacks

Define explicit behavior for:

* **No media selected:** show default background color (or transparent)
* **Media load failure:** keep rendering UI; log error
* **Offline/missing asset:** clear media and fall back cleanly

---

### 11) Validation and packaging requirements

To ensure media-selector works reliably:

* `tools/media_editor/MediaEditor.js` and `tools/media_editor/MediaEditor.css` must be reachable by relative path
* If MediaEditor fails to load, the widget must not block rendering (log and fall back)
* `#media-background` must be present in HTML and must not be `display:none` at any time


## 5.2 Quick Reference: Code Style Rules

1. Use minimal JS and CSS
2. Never use `&` in labels - use `&amp;`
3. Wrap all user-visible strings with `tr()`
4. Use CSS custom properties for theming
5. Property names: CamelCase, Latin letters and digits only
6. Always check property existence: `typeof prop !== 'undefined'`
7. Widget Personalization group **must be last**
8. Use `data-restrictions` JSON format, NOT `data-device-types`
9. Include `x-icue-interactive` if widget has any interaction
10. Implement loading/empty/error states for API-driven widgets
11. Safe areas: WideStrip 5%/10%, TallStack 10%, SquareTile 12%











