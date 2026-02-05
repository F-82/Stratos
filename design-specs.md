# Design Specifications - Banking App UI

## Color Palette

### Primary Gradients
- **Light Cyan to Deep Navy**: 
  - Top: `#B8E8F5` (light cyan/turquoise)
  - Mid-top: `#7DD3E8` (cyan)
  - Mid: `#5B8FB9` (blue)
  - Mid-bottom: `#3D5A80` (deep blue)
  - Bottom: `#1A2332` (navy/dark blue)
  - Pure Navy: `#0F1419` (almost black navy)

### Accent Colors
- **Deep Blue**: `#1E3A5F` - Primary dark blue
- **Navy Black**: `#0A0E14` - Almost black backgrounds
- **Bright Cyan**: `#6DD5ED` - Highlight color
- **Light Blue**: `#A8D8EA` - Soft accent
- **White**: `#FFFFFF` - Text and cards
- **Off-White**: `#F8F9FA` - Secondary backgrounds

### Card Backgrounds
- **Glassmorphism Effect**: Semi-transparent white with backdrop blur
  - Background: `rgba(255, 255, 255, 0.15)`
  - Backdrop filter: `blur(10px)`
  - Border: `1px solid rgba(255, 255, 255, 0.2)`

## Typography

### Font Family
- Primary: **Inter** or **SF Pro Display** (geometric sans-serif)
- Fallback: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`

### Font Weights
- **Light**: 300 (body text on dark backgrounds)
- **Regular**: 400 (general text)
- **Medium**: 500 (labels, secondary headings)
- **Semibold**: 600 (button text, card titles)
- **Bold**: 700 (main headings, large numbers)
- **Extrabold**: 800 (hero titles like "TOMORROW'S BANKING IS HERE")

### Font Sizes
- **Hero Title**: 32-40px (bold/extrabold)
- **Large Display**: 48-56px (numbers like "$24,092.67")
- **Section Heading**: 20-24px (semibold)
- **Body Text**: 14-16px (regular/medium)
- **Small Text**: 12-13px (labels, descriptions)
- **Tiny Text**: 10-11px (metadata)

## Layout & Spacing

### Border Radius
- **Small**: 8px (input fields)
- **Medium**: 12px (cards, buttons)
- **Large**: 16px (major cards)
- **Extra Large**: 24px (hero cards, main containers)

### Padding
- **Tight**: 8px
- **Standard**: 16px
- **Comfortable**: 24px
- **Spacious**: 32px
- **Hero**: 48px (main sections)

### Shadows
- **Soft Shadow**: `0 4px 6px rgba(0, 0, 0, 0.1)`
- **Medium Shadow**: `0 10px 25px rgba(0, 0, 0, 0.15)`
- **Deep Shadow**: `0 20px 40px rgba(0, 0, 0, 0.2)`
- **Card Shadow**: `0 8px 32px rgba(0, 0, 0, 0.12)`

## Components

### Buttons
- **Primary Button**:
  - Background: White `#FFFFFF`
  - Text: Navy `#0F1419`
  - Border radius: 24px (pill shape)
  - Padding: 16px 32px
  - Font: Semibold, 16px
  - Shadow: Medium
  - Hover: Slight scale (1.02) and shadow increase

- **Secondary Button**:
  - Background: Transparent
  - Text: White `#FFFFFF`
  - Border: 1px solid white
  - Border radius: 24px
  - Padding: 16px 32px

### Cards
- **Glassmorphism Cards**:
  - Background: `rgba(255, 255, 255, 0.1)` to `rgba(255, 255, 255, 0.2)`
  - Backdrop blur: 10-20px
  - Border: 1px solid `rgba(255, 255, 255, 0.2)`
  - Border radius: 16-24px
  - Shadow: Card shadow

- **White Cards**:
  - Background: `#FFFFFF`
  - Border radius: 16px
  - Shadow: Soft to medium
  - Padding: 20-24px

### Input Fields
- Background: `rgba(255, 255, 255, 0.1)` on dark, `#F8F9FA` on light
- Border: 1px solid `rgba(255, 255, 255, 0.2)` or `#E5E7EB`
- Border radius: 12px
- Padding: 12px 16px
- Focus: Ring effect with primary color

## Gradient Implementations

### Main Background Gradient
```css
background: linear-gradient(
  180deg,
  #B8E8F5 0%,
  #7DD3E8 20%,
  #5B8FB9 40%,
  #3D5A80 60%,
  #1A2332 80%,
  #0F1419 100%
);
```

### Hero Section Gradient
```css
background: linear-gradient(
  180deg,
  #A8D8EA 0%,
  #6DD5ED 30%,
  #2E5090 70%,
  #0A0E14 100%
);
```

### Card Gradient (Subtle)
```css
background: linear-gradient(
  135deg,
  rgba(255, 255, 255, 0.15) 0%,
  rgba(255, 255, 255, 0.05) 100%
);
```

## Visual Effects

### Backdrop Blur (Glassmorphism)
```css
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px);
```

### Smooth Transitions
```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

### Hover Effects
- Scale: `transform: scale(1.02)`
- Shadow increase
- Opacity change: `opacity: 0.9`

## Key Design Principles

1. **Premium Feel**: Use gradients, glassmorphism, and generous spacing
2. **Modern Typography**: Large, bold headings with clean sans-serif fonts
3. **Depth**: Layer cards with shadows and blur effects
4. **Color Harmony**: Smooth transitions from light cyan to deep navy
5. **Minimalism**: Clean layouts with ample white space
6. **Rounded Corners**: Everything has soft, rounded edges (12-24px)
7. **Contrast**: White text on dark gradients, dark text on white cards
