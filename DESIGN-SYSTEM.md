# Hawaii Tee Times Design System

A comprehensive, mobile-first design system built with Tailwind-inspired patterns for the Hawaii Tee Times golf booking platform.

## Overview

This design system provides a consistent, scalable foundation for the Hawaii Tee Times website, emphasizing:
- **Mobile-first responsive design** using Tailwind breakpoints
- **Golf and Hawaii-inspired color palette**
- **Consistent typography scale**
- **Touch-friendly interactive elements**
- **Modular component system**

## Breakpoints (Tailwind-inspired)

```css
--breakpoint-sm: 640px;   /* Small devices (phones) */
--breakpoint-md: 768px;   /* Medium devices (tablets) */
--breakpoint-lg: 1024px;  /* Large devices (laptops) */
--breakpoint-xl: 1280px;  /* Extra large devices (desktops) */
--breakpoint-2xl: 1536px; /* 2X Extra large devices */
```

## Color Palette

### Primary Colors (Golf Green)
- `--color-primary: #2D7D32` (Forest Green)
- `--color-primary-light: #4CAF50` (Lighter Green)
- `--color-primary-dark: #1B5E20` (Darker Green)

### Secondary Colors (Ocean Blue)
- `--color-secondary: #0277BD` (Ocean Blue)
- `--color-secondary-light: #03A9F4` (Light Blue)
- `--color-secondary-dark: #01579B` (Dark Blue)

### Accent Colors (Hawaiian Sunset)
- `--color-accent: #FF8F00` (Sunset Orange)
- `--color-accent-light: #FFC107` (Golden Yellow)
- `--color-accent-dark: #E65100` (Deep Orange)

### Neutral Grays
- `--color-gray-50` through `--color-gray-900`
- Semantic colors: success, warning, error, info

## Typography

### Font Families
- **Primary:** Inter (body text, UI elements)
- **Headings:** Poppins (titles, headings)
- **Monospace:** SF Mono (code, data)

### Font Scale
- `--font-size-xs: 0.75rem` (12px)
- `--font-size-sm: 0.875rem` (14px)
- `--font-size-base: 1rem` (16px)
- `--font-size-lg: 1.125rem` (18px)
- `--font-size-xl: 1.25rem` (20px)
- `--font-size-2xl: 1.5rem` (24px)
- `--font-size-3xl: 1.875rem` (30px)
- `--font-size-4xl: 2.25rem` (36px)
- `--font-size-5xl: 3rem` (48px)

### Responsive Typography
Typography automatically scales across breakpoints:

**Mobile (default):**
- H1: 24px
- H2: 20px
- Body: 16px

**Tablet (768px+):**
- H1: 30px
- H2: 24px
- Body: 16px

**Desktop (1024px+):**
- H1: 36px
- H2: 30px
- Body: 18px

## Spacing Scale

Consistent spacing based on rem units:
- `--space-1: 0.25rem` (4px)
- `--space-2: 0.5rem` (8px)
- `--space-3: 0.75rem` (12px)
- `--space-4: 1rem` (16px)
- `--space-6: 1.5rem` (24px)
- `--space-8: 2rem` (32px)
- `--space-12: 3rem` (48px)
- `--space-16: 4rem` (64px)
- And more...

## Component System

### Buttons

#### Primary Button
```html
<button class="btn btn-primary">Book Now</button>
```
- Green gradient background
- White text
- Hover effects with transform and shadow

#### Secondary Button  
```html
<button class="btn btn-secondary">Learn More</button>
```
- Blue gradient background
- White text

#### Button Sizes
- `.btn-sm` - Small (36px height)
- `.btn` - Default (44px height)
- `.btn-lg` - Large (52px height)
- `.btn-full` - Full width

### Cards

#### Basic Card
```html
<div class="card">
  <div class="card-header">
    <h3>Card Title</h3>
  </div>
  <div class="card-body">
    <p>Card content goes here</p>
  </div>
</div>
```

#### Island Cards (Specific to Hawaii Tee Times)
```html
<div class="island-cards">
  <div class="island-card">
    <img src="island-image.jpg" alt="Island">
    <div class="island-card-content">
      <h3>Big Island</h3>
      <div class="island-price">Starting at $55</div>
      <button class="book-now-btn">Book Now</button>
    </div>
  </div>
</div>
```

### Grid System

#### Basic Grid
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <div>Item 4</div>
</div>
```

#### Responsive Grid Classes
- `grid-cols-1` through `grid-cols-4`
- `sm:grid-cols-*` for small screens (640px+)
- `md:grid-cols-*` for medium screens (768px+)
- `lg:grid-cols-*` for large screens (1024px+)

### Search Component

```html
<div class="search-component">
  <div class="search-row">
    <div class="search-field">
      <label>Island</label>
      <select>
        <option>Select Island</option>
      </select>
    </div>
    <div class="search-field">
      <label>Course</label>
      <select>
        <option>Select Course</option>
      </select>
    </div>
    <button class="search-button">Search</button>
  </div>
</div>
```

## Container System

Responsive containers that adapt to screen size:

```html
<div class="container">
  <!-- Content automatically centered with proper padding -->
</div>
```

**Container Max Widths:**
- Mobile: 100% width, 12px padding
- Small: 640px max-width, 24px padding
- Medium: 768px max-width
- Large: 1024px max-width
- XL: 1280px max-width
- 2XL: 1536px max-width

## Utility Classes

### Spacing
- `.p-4` - Padding 16px
- `.m-4` - Margin 16px
- `.mt-4` - Margin-top 16px
- `.pt-4` - Padding-top 16px

### Text
- `.text-center` - Center align
- `.text-lg` - Large text
- `.font-bold` - Bold weight
- `.text-primary` - Primary color

### Layout
- `.flex` - Flexbox
- `.flex-col` - Flex column
- `.items-center` - Center align items
- `.justify-between` - Space between

### Colors
- `.bg-primary` - Primary background
- `.text-gray-700` - Gray text
- `.border-gray-300` - Gray border

## Mobile-First Guidelines

1. **Start with mobile** - All styles default to mobile
2. **Use min-width media queries** - Scale up progressively
3. **Touch-friendly targets** - Minimum 44px touch targets
4. **Full-width mobile sections** - Use `.mobile-full-width` when needed
5. **Readable text sizes** - Never below 16px on mobile

## Implementation Examples

### Homepage Island Cards
```css
.island-cards {
  /* Mobile: Single column */
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

@media (min-width: 640px) {
  .island-cards {
    /* Tablet: 2 columns */
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .island-cards {
    /* Desktop: 4 columns */
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### Feature Sections
```css
.feature-section {
  /* Mobile padding */
  padding: var(--space-8) var(--space-4);
}

@media (min-width: 768px) {
  .feature-section {
    /* Desktop padding */
    padding: var(--space-12) var(--space-6);
  }
}
```

## Best Practices

1. **Use CSS variables** - Always reference design tokens
2. **Mobile-first approach** - Default styles for mobile, enhance for larger screens
3. **Consistent spacing** - Use the spacing scale, avoid arbitrary values
4. **Semantic colors** - Use meaningful color names (primary, secondary, success)
5. **Touch targets** - Ensure interactive elements are at least 44px
6. **Performance** - Leverage CSS Grid and Flexbox for efficient layouts

## File Structure

The design system is implemented in:
- `/assets/styles.css.liquid` - Main stylesheet with all design system code
- CSS variables defined in `:root` selector
- Mobile-first media queries throughout
- Component-specific styles organized by section

This design system provides a solid foundation for creating consistent, accessible, and beautiful golf course booking experiences across all devices.