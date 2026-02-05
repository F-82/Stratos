# New Design Specifications - Darker Gradient Theme

## Color Palette

### Primary Gradient (Dark to Light Blue)
- **Almost Black**: `#0E1011` - Darkest point (bottom)
- **Deep Navy**: `#01084D` - Dark blue
- **Medium Blue**: `#498DBA` - Mid-tone blue
- **Light Blue**: `#8EC3DC` - Lightest point (top)

### Gradient Implementation
```css
background: linear-gradient(
  180deg,
  #8EC3DC 0%,
  #498DBA 35%,
  #01084D 70%,
  #0E1011 100%
);
```

### Additional Colors
- **Pure White**: `#FFFFFF` - Text on dark backgrounds, buttons
- **Off-White**: `#F8F9FA` - Secondary text
- **Light Gray**: `#E5E7EB` - Borders on light backgrounds
- **Dark Gray**: `#1F2937` - Card backgrounds (alternative)

## Noise Texture

Add a subtle noise texture overlay to create depth and sophistication:

```css
background-image: 
  url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E"),
  linear-gradient(180deg, #8EC3DC 0%, #498DBA 35%, #01084D 70%, #0E1011 100%);
```

## Key Differences from Previous Design

1. **Darker Overall Tone**: Previous design was lighter cyan-to-navy, new design is much darker
2. **More Dramatic**: Stronger contrast between light and dark areas
3. **Noise Texture**: Adds sophistication and depth
4. **Professional Feel**: More serious, enterprise-grade appearance

## Typography

- All text on gradient backgrounds should be **white** or very light
- Maintain Inter font family
- Keep existing font sizes and weights

## Glassmorphism Adjustments

For darker backgrounds, glassmorphism needs adjustment:

```css
.glass-dark-bg {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}
```

## Card Designs

- Cards on gradient: Use semi-transparent white with blur
- Cards on light areas: Can use white with shadows
- Maintain rounded corners (16-24px)

## Application

This gradient and noise texture should be applied to:
1. Landing page (home)
2. Login page
3. Dashboard background
4. Borrowers pages
5. Loans pages
6. Collector pages
7. All other pages in the application
