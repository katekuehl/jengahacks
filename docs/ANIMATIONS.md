# Animations and Transitions Guide

This document describes the animations and transitions implemented throughout the JengaHacks Hub application.

## Overview

The application uses a combination of CSS animations, Tailwind CSS transitions, and React-based animation components to create smooth, engaging user experiences.

## Animation Types

### 1. Page Transitions

**Component**: `PageTransition`
- **Location**: `src/components/PageTransition.tsx`
- **Purpose**: Smooth fade-in animations when navigating between routes
- **Implementation**: Uses React Router location changes to trigger animations
- **Duration**: 400ms with smooth easing

**Usage**:
```tsx
<PageTransition>
  <YourPageContent />
</PageTransition>
```

### 2. Scroll-Reveal Animations

**Component**: `ScrollReveal`
- **Location**: `src/components/ScrollReveal.tsx`
- **Purpose**: Animate elements when they come into viewport
- **Directions**: up, down, left, right, fade
- **Implementation**: Uses Intersection Observer API

**Usage**:
```tsx
<ScrollReveal direction="up" delay={200}>
  <YourComponent />
</ScrollReveal>
```

### 3. Button Animations

**Enhanced Features**:
- Hover scale effects (scale-105 to scale-110)
- Active state scale-down (scale-95)
- Smooth transitions (300ms duration)
- Icon animations (translate on hover)
- Loading spinner animations

**Variants**:
- `hero`: Enhanced glow and scale effects
- `outline`: Shadow and scale on hover
- `default`: Subtle scale and glow

### 4. Input Field Animations

**Features**:
- Focus scale effect (scale-[1.01])
- Border color transitions
- Smooth focus ring animations
- Validation state animations

### 5. Navigation Animations

**Navbar Features**:
- Mobile menu slide-down animation
- Icon rotation transitions (Menu ↔ X)
- Link underline animations on hover
- Staggered animation delays for menu items
- Smooth backdrop blur transitions

**Desktop Navigation**:
- Underline animation on hover
- Color transitions
- Staggered entry animations

**Mobile Navigation**:
- Slide-down reveal
- Transform animations on link hover
- Smooth height transitions

### 6. Form Animations

**Registration Form**:
- Loading spinner in submit button
- Smooth validation state transitions
- Error message animations
- Success indicator animations
- File upload state transitions

### 7. Hero Section Animations

**Features**:
- Staggered slide-up animations
- Floating gradient orbs
- Arrow icon translation on hover
- Scroll indicator bounce animation
- Pulse glow effects

## Custom Animations

### CSS Keyframes

Located in `src/index.css`:

1. **float**: Floating animation for gradient orbs
   ```css
   @keyframes float {
     0%, 100% { transform: translateY(0); }
     50% { transform: translateY(-10px); }
   }
   ```

2. **pulse-glow**: Pulsing glow effect
   ```css
   @keyframes pulse-glow {
     0%, 100% { box-shadow: 0 0 20px hsl(var(--glow) / 0.3); }
     50% { box-shadow: 0 0 40px hsl(var(--glow) / 0.5); }
   }
   ```

3. **slide-up**: Slide up with fade
   ```css
   @keyframes slide-up {
     from { opacity: 0; transform: translateY(20px); }
     to { opacity: 1; transform: translateY(0); }
   }
   ```

4. **shimmer**: Loading shimmer effect
   ```css
   @keyframes shimmer {
     0% { background-position: -1000px 0; }
     100% { background-position: 1000px 0; }
   }
   ```

### Tailwind Animations

Extended in `tailwind.config.ts`:

- `fade-in`: Fade in animation
- `fade-out`: Fade out animation
- `slide-in-right`: Slide from right
- `slide-in-left`: Slide from left
- `slide-in-up`: Slide from bottom
- `slide-in-down`: Slide from top
- `scale-in`: Scale in animation
- `scale-out`: Scale out animation
- `shimmer`: Shimmer loading effect
- `spin-slow`: Slow rotation
- `wiggle`: Wiggle animation
- `bounce-in`: Bounce in effect
- `gradient-shift`: Gradient position shift

## Animation Utilities

### Delay Classes

```css
.delay-100 { animation-delay: 100ms; }
.delay-200 { animation-delay: 200ms; }
.delay-300 { animation-delay: 300ms; }
.delay-400 { animation-delay: 400ms; }
.delay-500 { animation-delay: 500ms; }
.delay-600 { animation-delay: 600ms; }
```

### Transition Utilities

```css
.transition-smooth {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Custom Timing Functions

- `ease-smooth`: Smooth cubic-bezier easing
- `bounce-in`: Bouncy cubic-bezier for entrances

## Performance Considerations

### Optimizations

1. **GPU Acceleration**: Transform and opacity animations use GPU acceleration
2. **Will-Change**: Applied where appropriate for smooth animations
3. **Reduced Motion**: Respects `prefers-reduced-motion` media query
4. **Intersection Observer**: Used for scroll-triggered animations to avoid constant checks

### Best Practices

1. **Duration**: Keep animations between 200-600ms for UI feedback
2. **Easing**: Use smooth easing functions (cubic-bezier)
3. **Stagger**: Use delays for sequential animations
4. **Performance**: Prefer transform and opacity over layout properties

## Accessibility

### Reduced Motion Support

Animations respect user preferences:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Focus States

All interactive elements have visible focus states with smooth transitions.

## Usage Examples

### Adding Scroll Reveal to a Section

```tsx
import ScrollReveal from "@/components/ScrollReveal";

<ScrollReveal direction="up" delay={200}>
  <YourSection />
</ScrollReveal>
```

### Creating Animated Buttons

```tsx
<Button 
  variant="hero" 
  className="group"
>
  Click Me
  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
</Button>
```

### Staggered Animations

```tsx
{items.map((item, index) => (
  <div 
    key={item.id}
    className="animate-slide-up"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    {item.content}
  </div>
))}
```

## Animation Guidelines

1. **Consistency**: Use consistent timing and easing across similar elements
2. **Purpose**: Every animation should have a purpose (feedback, guidance, delight)
3. **Performance**: Monitor animation performance, especially on mobile devices
4. **Accessibility**: Always respect reduced motion preferences
5. **Testing**: Test animations across different devices and browsers

## Success/Error Animations

### Form Validation Animations

**Success Indicators**:
- CheckCircle icons use `animate-success-pulse` for a subtle pulse effect
- Success messages slide in from the right with `animate-slide-in-right`
- Valid input borders transition smoothly to primary color

**Error Indicators**:
- XCircle icons use `animate-bounce-in` for attention-grabbing entrance
- Error messages slide in from the right with `animate-slide-in-right`
- Error input borders flash with `animate-error-flash` (subtle background color change)
- Error icons bounce in with `animate-bounce-in`

**Animation Details**:
- `animate-success-pulse`: Subtle scale and opacity pulse (0.6s)
- `animate-error-flash`: Background color flash (0.3s)
- `animate-bounce-in`: Bouncy scale animation (0.6s)
- `animate-slide-in-right`: Slide in from right (0.4s)
- `animate-shake`: Horizontal shake for error toasts (0.5s)

### Toast Notifications

**Success Toasts**:
- Slide in from right/bottom
- Primary border color
- Subtle background tint

**Error Toasts**:
- Slide in from right/bottom
- Destructive border color
- Shake animation on appearance
- Subtle background tint

### Usage Examples

**Animated Success Icon**:
```tsx
<CheckCircle className="w-5 h-5 text-primary animate-success-pulse" />
```

**Animated Error Message**:
```tsx
<p className="text-sm text-destructive animate-slide-in-right" role="alert">
  <AlertCircle className="w-4 h-4 animate-bounce-in" />
  Error message
</p>
```

**Error Input Field**:
```tsx
<Input
  className={cn(
    "transition-all duration-300",
    errors.field && "border-destructive animate-error-flash"
  )}
/>
```

## Future Enhancements

Potential additions:
- [ ] Framer Motion integration for complex animations
- [ ] Page transition variants (slide, fade, scale)
- [ ] Micro-interactions for form fields
- [ ] Loading skeleton animations
- [x] Success/error state animations
- [ ] Parallax scrolling effects
- [ ] Scroll progress indicators
- [ ] Confetti animation for successful form submission

