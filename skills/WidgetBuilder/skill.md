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

Read documentation from `Documentation/` folder:

- `CUEDEVS-Widget Creation-*.pdf` - Basic structure
- `CUEDEVS-Widget Meta Parameters-*.pdf` - All property types
- `CUEDEVS-JavaScript Expressions in Meta Parameters-*.pdf` - Dynamic expressions
- `CUEDEVS-Using Local Storage With Widgets-*.pdf` - Data persistence

### 2.2 Device Specifications

| Device                        | Resolution                                                                                                                                                                                                                                                                                                                                      |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dashboard_lcd` (Xeneon Edge) | 2536x696 (horizontal), varies S/M/L/XL  * **Xeneon Edge (dashboard_lcd)**: S / M / L / XL (horizontal & vertical):<br/>S, horizontal: 840×344<br/>S, vertical: 696×416<br/>M,  horizontal: 840×696<br/>M, vertical: 696×840<br/>L,  horizontal: 1688×696<br/>L, vertical: 696×1688<br/>XL, horizontal: 2536×696<br/>XL, vertical: 696×2536<br/> |
| `pump_lcd`                    | 480x480 (circular)                                                                                                                                                                                                                                                                                                                              |
| `keyboard`                    | 320x170                                                                                                                                                                                                                                                                                                                                         |

### 2.3 Layout Classes (Choose One)

- **WideStrip**: Horizontal layout, 1 primary + up to 2 secondary elements
- **TallStack**: Vertical layout, 1 primary + up to 3 stacked elements
- **SquareTile**: Compact layout, 1 value OR 1 icon + 1 label

If shortest screen edge < 700px, automatically simplify the layout.

### 2.4 Design Specifications

```
Widget Name: [Name]
Layout Class: [WideStrip | TallStack | SquareTile]
Target Devices: [dashboard_lcd | pump_lcd | keyboard]

Properties:
  - [propertyName]: [type] - [description] - [default]

Property Groups:
  - [Widget Name]: [feature properties...]
  - Widget Personalization: [textColor, accentColor, backgroundColor, transparency]

States Required:
  - Loading state
  - Empty state (if applicable)
  - Error/offline state (if API-driven)
```

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
  <meta name="x-icue-property" content="textColor" data-label="tr('Text Color')" data-type="color" data-default="'#ffffff'">
  <meta name="x-icue-property" content="accentColor" data-label="tr('Accent Color')" data-type="color" data-default="'#ffffff'">
  <meta name="x-icue-property" content="backgroundColor" data-label="tr('Background')" data-type="color" data-default="'#000000'">
  <meta name="x-icue-property" content="transparency" data-label="tr('Transparency')" data-type="slider" data-default="100" data-min="0" data-max="100" data-step="1">

  <!-- Property grouping - Widget Personalization MUST be last -->
  <script id="x-icue-groups" type="application/json">
  [
    { "title": "tr('[Widget Name]')", "properties": [...] },
    { "title": "tr('Widget Personalization')", "properties": ["textColor", "accentColor", "backgroundColor", "transparency"] }
  ]
  </script>

  <link rel="stylesheet" type="text/css" href="styles/[WidgetName].css">
</head>
<body>
  <div class="widget-root">
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

    function applyStyles() {
      const root = document.documentElement;

      // Apply transparency
      const t = Number(typeof transparency !== 'undefined' ? transparency : 100);
      root.style.setProperty('--transparency', Number.isFinite(t) ? t / 100 : 1);

      // Apply colors (use consistent variable names between JS and CSS)
      root.style.setProperty('--text-color', typeof textColor !== 'undefined' ? textColor : '#ffffff');
      root.style.setProperty('--accent-color', typeof accentColor !== 'undefined' ? accentColor : '#ffffff');
      root.style.setProperty('--bg-color', typeof backgroundColor !== 'undefined' ? backgroundColor : '#000000');
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
  opacity: var(--transparency);
  background: var(--bg-color);
  color: var(--text-color);
  /* Safe areas based on layout class */
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
- If possible - use free API. Make sure that all references and requirements for the usage are followed.
- If there is no free API for the data - suggest user to enter API key in iCUE as a parameter.

### 3.7 Graphics Requirements

- Icons must be **single-color SVGs, or PNGs** with transparent background
- For illustrations and icons - try to find the online first
- In case if there is no free images available - geenrate own versions.
- No gradients or fine detail under 500px display size
- Prefer high-contrast solid shapes
- Store in `/images/` directory

## Phase 4: Browser Testing

### 4.1 Run in Browser

Open HTML file in Browser to check UI and data. 

### 4.2 Test Different Screen Sizes

Use browser DevTools to simulate:

- Xeneon Edge all sizes
- Pump LCD
- Keyboard

### 4.3 Quality Override Rules

If widget cannot scale cleanly to small sizes:

- Generate a simplified micro variant
- Hide secondary elements when shortest edge < 700px
- Switch to icon + single value layout

## Phase 5: Preflight Check (MANDATORY)

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

## Quick Reference: Code Style Rules

1. Use minimal JS and CSS
2. Never use `&` in labels - use `&amp;`
3. Wrap all user-visible strings with `tr()`
4. Use CSS custom properties for theming
5. Property names: camelCase, Latin letters and digits only
6. Always check property existence: `typeof prop !== 'undefined'`
7. Widget Personalization group **must be last**
8. Use `data-restrictions` JSON format, NOT `data-device-types`
9. Include `x-icue-interactive` if widget has any interaction
10. Implement loading/empty/error states for API-driven widgets
11. Typography: base = shortestEdge / 12, never below 12px
12. Safe areas: WideStrip 5%/10%, TallStack 10%, SquareTile 12%
