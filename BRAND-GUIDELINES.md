# Hawaii Tee Times Brand Guidelines

*Professional Golf Course Booking Platform - Mobile-First Brand Standards*

## Brand Overview

Hawaii Tee Times represents premium golf experiences across the Hawaiian Islands. Our brand combines the natural beauty of Hawaii with the precision and tradition of golf, creating an authentic, accessible, and inspiring booking platform.

### Brand Values
- **Aloha Spirit**: Welcoming, warm, and inclusive
- **Natural Beauty**: Reflecting Hawaii's stunning landscapes
- **Golf Excellence**: Professional, precise, trustworthy
- **Accessibility**: Easy booking for all skill levels
- **Authenticity**: Genuine Hawaiian experience

---

## Visual Identity

### Logo & Brand Mark
- **Primary Logo**: Hawaii Tee Times wordmark with golf/island elements
- **Usage**: Always maintain clear space equal to the height of the "H"
- **Minimum Size**: 120px width for digital, 1" for print
- **Colors**: Always use brand colors, never alter logo colors

### Color Palette

#### Primary Colors
```css
--color-primary: #2D7D32        /* Golf Course Green */
--color-primary-light: #4CAF50   /* Fairway Green */
--color-primary-dark: #1B5E20    /* Deep Forest Green */
```
**Usage**: Primary CTAs, navigation, golf-related elements

#### Secondary Colors  
```css
--color-secondary: #0277BD       /* Pacific Ocean Blue */
--color-secondary-light: #03A9F4  /* Tropical Sky Blue */
--color-secondary-dark: #01579B   /* Deep Ocean Blue */
```
**Usage**: Secondary actions, water elements, sky backgrounds

#### Accent Colors
```css
--color-accent: #FF8F00          /* Hawaiian Sunset Orange */
--color-accent-light: #FFC107    /* Golden Hour Yellow */
--color-accent-dark: #E65100     /* Volcanic Orange */
```
**Usage**: Highlights, promotions, special offers, warnings

#### Neutral Palette
- **Gray 50-100**: Backgrounds, subtle sections
- **Gray 200-400**: Borders, dividers, inactive states  
- **Gray 500-700**: Body text, secondary information
- **Gray 800-900**: Headings, primary text

---

## Typography System

### Font Families
- **Primary**: Inter (Clean, modern, highly readable)
- **Headings**: Poppins (Friendly, approachable, distinctive)
- **Data/Code**: SF Mono (Technical information, pricing)

### Typography Scale & Usage

#### Display Headings (Hero Sections)
```css
.new-h1 / .new-heading-1
```
- **Mobile**: 24px (1.5rem)
- **Tablet**: 30px (1.875rem)  
- **Desktop**: 36px (2.25rem)
- **Usage**: Page titles, hero headlines
- **Style**: Bold weight, tight line-height

#### Section Headings
```css
.new-h2 / .new-heading-2
```
- **Mobile**: 20px (1.25rem)
- **Tablet**: 24px (1.5rem)
- **Desktop**: 30px (1.875rem)
- **Usage**: Section titles, feature headings
- **Style**: Semibold weight, snug line-height

#### Subsection Headings
```css
.new-h3 / .new-heading-3
```
- **Mobile**: 18px (1.125rem)
- **Tablet**: 20px (1.25rem)
- **Desktop**: 24px (1.5rem)
- **Usage**: Card titles, course names
- **Style**: Semibold weight

#### Body Text
```css
.new-body / .new-text / .new-paragraph
```
- **Mobile**: 16px (1rem)
- **Desktop**: 18px (1.125rem)
- **Usage**: Descriptions, content, UI text
- **Style**: Normal weight, relaxed line-height

---

## Section Design Patterns

### 1. Hero Sections

#### Full-Screen Hero
```html
<section class="new-hero-full">
  <div class="new-hero-content">
    <h1 class="new-h1">Book Your Perfect Hawaii Golf Experience</h1>
    <p class="new-hero-subtitle">Discover premier golf courses across all Hawaiian islands</p>
    <div class="new-hero-actions">
      <button class="new-btn new-btn-primary new-btn-lg">Find Tee Times</button>
      <button class="new-btn new-btn-outline new-btn-lg">Browse Courses</button>
    </div>
  </div>
  <div class="new-hero-image">
    <!-- Background image or video -->
  </div>
</section>
```

**Design Specs:**
- **Height**: 100vh on mobile, 80vh on desktop
- **Background**: High-quality golf course imagery
- **Overlay**: Dark gradient (40% opacity) for text legibility
- **Content**: Centered, maximum 600px width
- **Actions**: 2 buttons max, different styles

### 2. Island Selection Sections

#### Grid Layout
```html
<section class="new-section new-island-selection">
  <div class="new-container">
    <div class="new-section-header">
      <h2 class="new-h2">Choose Your Island</h2>
      <p class="new-section-subtitle">Each island offers unique golf experiences</p>
    </div>
    <div class="new-island-cards new-grid new-grid-cols-1 new-sm:grid-cols-2 new-lg:grid-cols-4">
      <!-- Island cards -->
    </div>
  </div>
</section>
```

**Design Specs:**
- **Mobile**: Single column, full-width cards
- **Tablet**: 2 columns with comfortable spacing
- **Desktop**: 4 columns, centered with max-width
- **Cards**: Hover effects, consistent imagery ratio (4:3)
- **Spacing**: 16px mobile, 24px desktop

### 3. Feature Sections

#### Three-Column Features
```html
<section class="new-section new-features">
  <div class="new-container">
    <div class="new-section-header new-text-center">
      <h2 class="new-h2">Why Choose Hawaii Tee Times</h2>
      <p class="new-section-subtitle">The premier golf booking platform for Hawaii</p>
    </div>
    <div class="new-feature-grid new-grid new-grid-cols-1 new-md:grid-cols-3">
      <!-- Feature cards -->
    </div>
  </div>
</section>
```

**Design Specs:**
- **Layout**: Mobile stack, desktop 3-column
- **Icons**: 48px, brand colors
- **Cards**: White background, subtle shadows
- **Spacing**: Consistent vertical rhythm

### 4. Search/Filter Sections

#### Booking Search
```html
<section class="new-section new-search-section">
  <div class="new-container">
    <div class="new-search-component">
      <h3 class="new-h3 new-text-center">Find Your Perfect Tee Time</h3>
      <div class="new-search-row">
        <!-- Search fields -->
      </div>
    </div>
  </div>
</section>
```

**Design Specs:**
- **Background**: Light gray or white
- **Component**: Centered card with shadow
- **Fields**: Touch-friendly (48px min height)
- **Button**: Primary color, rounded corners

### 5. Content Sections

#### Two-Column Content
```html
<section class="new-section new-content-section">
  <div class="new-container">
    <div class="new-content-grid new-grid new-grid-cols-1 new-lg:grid-cols-2 new-items-center">
      <div class="new-content-text">
        <h2 class="new-h2">Experience Hawaii's Best Golf Courses</h2>
        <p class="new-body">Content describing the golf experience...</p>
        <button class="new-btn new-btn-secondary">Learn More</button>
      </div>
      <div class="new-content-image">
        <img src="..." alt="..." class="new-rounded-xl">
      </div>
    </div>
  </div>
</section>
```

**Design Specs:**
- **Mobile**: Text first, then image
- **Desktop**: Text and image side-by-side
- **Images**: 16:9 ratio, rounded corners
- **Text**: Left-aligned, comfortable line length

---

## Component Standards

### Buttons

#### Primary Actions
```html
<button class="new-btn new-btn-primary">Book Now</button>
```
- **Color**: Golf green gradient
- **Usage**: Main CTAs, booking actions
- **States**: Hover lift effect, focus ring

#### Secondary Actions  
```html
<button class="new-btn new-btn-secondary">Learn More</button>
```
- **Color**: Ocean blue gradient
- **Usage**: Secondary actions, navigation

#### Ghost/Outline
```html
<button class="new-btn new-btn-outline">View Details</button>
```
- **Style**: Transparent with border
- **Usage**: Tertiary actions, less emphasis

### Cards

#### Standard Card
```html
<div class="new-card">
  <div class="new-card-header">
    <h3 class="new-h3">Card Title</h3>
  </div>
  <div class="new-card-body">
    <p class="new-body">Card content...</p>
  </div>
  <div class="new-card-footer">
    <button class="new-btn new-btn-primary new-btn-sm">Action</button>
  </div>
</div>
```

**Design Specs:**
- **Background**: White
- **Border**: 1px light gray
- **Radius**: 12px (--radius-xl)
- **Shadow**: Subtle, increases on hover
- **Padding**: 24px (--space-6)

### Forms

#### Input Fields
```html
<div class="new-form-field">
  <label class="new-form-label">Label</label>
  <input class="new-form-input" type="text" placeholder="Placeholder">
</div>
```

**Design Specs:**
- **Height**: 48px minimum (touch-friendly)
- **Border**: 1px gray, rounded corners
- **Focus**: Primary color border + shadow
- **Typography**: 16px (prevents zoom on iOS)

---

## Mobile-First Guidelines

### Breakpoint Strategy
1. **Mobile First**: Design for 320px-767px
2. **Tablet**: Enhance for 768px-1023px  
3. **Desktop**: Optimize for 1024px+

### Touch Targets
- **Minimum**: 44px x 44px
- **Recommended**: 48px x 48px
- **Spacing**: 8px minimum between targets

### Content Strategy
- **Mobile**: Single column, stacked content
- **Progressive Enhancement**: Add columns as space allows
- **Touch Gestures**: Swipe for carousels, tap for interactions

---

## Imagery Guidelines

### Photography Style
- **Quality**: High resolution (2x for retina)
- **Subject**: Golf courses, Hawaiian landscapes, players
- **Mood**: Bright, aspirational, authentic
- **Composition**: Rule of thirds, leading lines

### Image Ratios
- **Hero**: 16:9 or 21:9
- **Cards**: 4:3 or 1:1
- **Content**: 16:9 or 3:2
- **Profile**: 1:1 (square)

### Treatment
- **Filters**: Minimal, maintain natural colors
- **Overlays**: Dark gradients for text legibility
- **Borders**: Rounded corners (8px-16px)

---

## Voice & Tone

### Brand Voice
- **Professional**: Expert golf knowledge
- **Welcoming**: Aloha spirit, inclusive
- **Helpful**: Clear guidance, easy booking
- **Authentic**: Genuine Hawaiian culture

### Tone Guidelines
- **Headlines**: Confident, inspiring
- **Body Text**: Friendly, informative
- **CTAs**: Action-oriented, clear
- **Errors**: Helpful, not blaming

### Content Principles
- **Clarity First**: Simple, scannable content
- **Benefits Over Features**: What's in it for the user
- **Local Expertise**: Hawaiian golf knowledge
- **Inclusivity**: Welcoming to all skill levels

---

## Accessibility Standards

### Color Contrast
- **Text**: Minimum 4.5:1 ratio
- **Large Text**: Minimum 3:1 ratio
- **Interactive Elements**: Clear focus states

### Typography
- **Line Length**: 45-75 characters for readability
- **Line Height**: 1.5-1.6 for body text
- **Font Size**: 16px minimum on mobile

### Navigation
- **Keyboard**: All interactive elements accessible
- **Screen Readers**: Proper heading hierarchy
- **Touch**: 44px minimum target size

---

## Implementation Checklist

### Every New Section Must Include:
- [ ] Mobile-first responsive design
- [ ] Proper semantic HTML structure  
- [ ] `new-` prefixed CSS classes only
- [ ] Brand color palette usage
- [ ] Consistent typography scale
- [ ] Touch-friendly interactive elements
- [ ] Accessibility considerations
- [ ] Hawaiian golf context/imagery

### Quality Assurance:
- [ ] Test on mobile devices (320px-767px)
- [ ] Verify tablet experience (768px-1023px)  
- [ ] Confirm desktop layout (1024px+)
- [ ] Check color contrast ratios
- [ ] Validate semantic HTML
- [ ] Test keyboard navigation
- [ ] Verify loading performance

---

## Design System Integration

All new sections and components MUST use the prefixed design system:

```html
<!-- ✅ CORRECT: Using new- prefixed classes -->
<section class="new-section">
  <div class="new-container">
    <h2 class="new-h2">Section Title</h2>
    <div class="new-grid new-grid-cols-1 new-md:grid-cols-3">
      <div class="new-card">
        <div class="new-card-body">
          <p class="new-body">Content...</p>
          <button class="new-btn new-btn-primary">Action</button>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ❌ INCORRECT: Using unprefixed or legacy classes -->
<section class="section">
  <div class="container">
    <h2>Section Title</h2>
    <div class="grid cols-3">
      <!-- Will conflict with legacy styles -->
    </div>
  </div>
</section>
```

This ensures complete isolation from legacy styles and consistent brand implementation across all new content.