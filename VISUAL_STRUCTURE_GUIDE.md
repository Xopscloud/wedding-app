# Wedding Moments - Visual Structure & Layout Guide

## Page Layout Structure

```
┌─────────────────────────────────────────────────────┐
│  HERO SECTION                                       │
│  ─────────────────────────────────────────────────  │
│  "Capturing Timeless Wedding Memories"             │
│  [Description paragraph]                           │
│  [View Full Gallery Button]                        │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ Image 1  │  │ Image 2  │  │ Image 3  │         │
│  │ (Hero)   │  │ (Hero)   │  │ (Hero)   │         │
│  └──────────┘  └──────────┘  └──────────┘         │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  MOMENT BLOCK 1 (Index 0 - DESKTOP LAYOUT)         │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  [Text Left]            [Image Grid Right]         │
│  ┌──────────────┐       ┌──────┬──────┐           │
│  │ Laura &      │       │      │      │           │
│  │ James        │       │  1   │  2   │           │
│  │              │       ├──────┼──────┤           │
│  │ Description  │       │      │      │           │
│  │ about this   │       │  3   │  4   │           │
│  │ couple...    │       └──────┴──────┘           │
│  │              │                                  │
│  │ [Button]     │                                  │
│  └──────────────┘                                  │
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  MOMENT BLOCK 2 (Index 1 - DESKTOP LAYOUT)         │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  [Image Grid Left]      [Text Right]              │
│  ┌──────┬──────┐        ┌──────────────┐          │
│  │      │      │        │ Maria &      │          │
│  │  1   │  2   │        │ Josh         │          │
│  ├──────┼──────┤        │              │          │
│  │      │      │        │ Description  │          │
│  │  3   │  4   │        │ about this   │          │
│  └──────┴──────┘        │ couple...    │          │
│                          │              │          │
│                          │ [Button]     │          │
│                          └──────────────┘          │
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  CTA SECTION                                        │
│  ─────────────────────────────────────────────────  │
│  "Ready to Capture Your Special Day?"             │
│  [Description]                                     │
│  [Get in Touch Button]                            │
└─────────────────────────────────────────────────────┘
```

## Mobile Layout (< 768px)

```
┌─────────────────────────┐
│  HERO SECTION           │
│  ─────────────────────  │
│  Title                  │
│  Description            │
│  Button                 │
│  ┌────────────────────┐ │
│  │ Image 1 (Full)     │ │
│  └────────────────────┘ │
│  ┌────────────────────┐ │
│  │ Image 2 (Full)     │ │
│  └────────────────────┘ │
│  ┌────────────────────┐ │
│  │ Image 3 (Full)     │ │
│  └────────────────────┘ │
└─────────────────────────┘

┌─────────────────────────┐
│  MOMENT BLOCK 1         │
│  ─────────────────────  │
│                         │
│  Text Section           │
│  - Title                │
│  - Description          │
│  - Button               │
│                         │
│  Image Grid (2x2)       │
│  ┌────────┬────────┐   │
│  │    1   │    2   │   │
│  ├────────┼────────┤   │
│  │    3   │    4   │   │
│  └────────┴────────┘   │
│                         │
└─────────────────────────┘

┌─────────────────────────┐
│  MOMENT BLOCK 2         │
│  ─────────────────────  │
│                         │
│  Image Grid (2x2)       │
│  ┌────────┬────────┐   │
│  │    1   │    2   │   │
│  ├────────┼────────┤   │
│  │    3   │    4   │   │
│  └────────┴────────┘   │
│                         │
│  Text Section           │
│  - Title                │
│  - Description          │
│  - Button               │
│                         │
└─────────────────────────┘
```

## Tablet Layout (768px - 1024px)

```
┌──────────────────────────────────────┐
│  HERO SECTION                        │
│  ──────────────────────────────────  │
│  Title (Centered)                    │
│  Description (Centered)              │
│  Button (Centered)                   │
│                                      │
│  ┌──────────┐  ┌──────────┐         │
│  │ Image 1  │  │ Image 2  │         │
│  └──────────┘  └──────────┘         │
│  ┌──────────┐                        │
│  │ Image 3  │                        │
│  └──────────┘                        │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  MOMENT BLOCK                        │
│  ──────────────────────────────────  │
│                                      │
│  [Text]         [2x2 Grid]          │
│  ┌────────┐    ┌─────┬─────┐       │
│  │        │    │ 1   │ 2   │       │
│  │ Title  │    ├─────┼─────┤       │
│  │        │    │ 3   │ 4   │       │
│  │ Desc   │    └─────┴─────┘       │
│  │        │                         │
│  │Button  │                         │
│  └────────┘                         │
│                                      │
└──────────────────────────────────────┘
```

## Typography Hierarchy

```
Hero Title
├─ Font: Cormorant Garamond, Serif
├─ Size: 5xl (48px desktop, 32px mobile)
├─ Weight: Semibold (600)
└─ Color: text-gray-800

Moment Block Title
├─ Font: Cormorant Garamond, Serif
├─ Size: 4xl/5xl (36px/48px)
├─ Weight: Semibold (600)
└─ Color: text-gray-800

Body Text / Description
├─ Font: Lora, Serif
├─ Size: base/lg (16px/18px)
├─ Weight: Light (300)
├─ Line Height: relaxed
└─ Color: text-gray-700

Buttons
├─ Font: System sans-serif
├─ Size: base (16px)
├─ Weight: Semibold (600)
├─ Style: Rounded full
└─ Color: text-gray-800
```

## Color Palette

```
Primary Colors:
┌─────────────────────────────────────────┐
│ Background: #F8F0EB (Floral)            │
│ Primary Accent: #DCC48E (Gold)          │
│ Button: #FBBF24 (Amber-300)             │
│ Text: #1F2937 (Gray-800)                │
└─────────────────────────────────────────┘

Secondary Colors:
┌─────────────────────────────────────────┐
│ Blush: #F6D1D1                          │
│ Sage: #CFE8D9                           │
│ Light Bg: #F9FAFB (Gray-50)             │
│ Text Secondary: #374151 (Gray-700)      │
└─────────────────────────────────────────┘

Gradients:
┌─────────────────────────────────────────┐
│ Button: from-amber-200 to-amber-300     │
│ Background: from-slate-50 via-white     │
│              to-slate-50                │
│ Hover: from-amber-300 to-amber-400      │
└─────────────────────────────────────────┘
```

## Image Grid Details

### 2x2 Grid (Standard Moment Block)
```
┌──────────────────┬──────────────────┐
│                  │                  │
│   Image 1        │   Image 2        │
│   (Square)       │   (Square)       │
│                  │                  │
├──────────────────┼──────────────────┤
│                  │                  │
│   Image 3        │   Image 4        │
│   (Square)       │   (Square)       │
│                  │                  │
└──────────────────┴──────────────────┘

Desktop: gap-5 (1.25rem)
Tablet:  gap-4 (1rem)
Mobile:  gap-4 (1rem)

Border Radius: 1.5rem (rounded-2xl)
Shadow: lg (0 10px 30px rgba(0,0,0,0.1))
Aspect Ratio: 1:1 (square)
```

## Animation Timings

```
Scroll In Animation
├─ Trigger: 15% of element in viewport
├─ Duration: 700ms
├─ Easing: ease-out
└─ Effect: Fade in + slide up

Image Stagger
├─ Base Delay: 0ms
├─ Per Image Delay: +120ms
├─ Image 1: 0ms
├─ Image 2: 120ms
├─ Image 3: 240ms
└─ Image 4: 360ms

Hover Effects
├─ Duration: 500-700ms
├─ Image Scale: 1 → 1.1
├─ Button Glow: shadow-lg → xl
└─ Easing: transition-transform duration-500
```

## Spacing & Sizing

```
Container
├─ Max Width: Not constrained (full width container)
├─ Padding: 1rem mobile, 1.5rem tablet, 2rem desktop
├─ Gap (horizontal): 2rem (tablet), 4rem (desktop)
└─ Gap (vertical): 4rem (gap-16 in Tailwind)

Hero Section
├─ Padding: py-12 mobile, py-20 desktop
├─ Title Spacing: mb-6
├─ Description Spacing: mb-8
└─ Image Grid: gap-4

Moment Blocks
├─ Padding: py-16 mobile, py-28 desktop
├─ Gap: gap-8 mobile, gap-16 desktop
├─ Text Gap: gap-6 (title/desc/button)
└─ Image Grid: gap-4 mobile, gap-5 desktop

Buttons
├─ Padding: px-8 py-3
├─ Border Radius: rounded-full
└─ Min Height: 48px (touch friendly)
```

## Responsive Breakpoints

```
Mobile First:
└─ Default: 320px - 767px
   └─ Single column
   └─ Full width images
   └─ Large padding
   └─ Stacked layout

Tablet:
└─ 768px - 1023px
   └─ 2 columns (partial)
   └─ Adjusted spacing
   └─ Medium padding

Desktop:
└─ 1024px+
   └─ Full 2-column layout
   └─ Alternating text/images
   └─ Generous spacing
```

## Accessibility Features

```
Semantic HTML:
├─ <section> for moment blocks
├─ <h1>, <h2> for headings
├─ <p> for paragraphs
├─ <button> for CTAs
└─ <img alt=""> for images

ARIA Attributes:
├─ alt text on all images
├─ Proper heading hierarchy
├─ Button role for clickables
└─ Lazy loading directive

Color Contrast:
├─ Text: Gray-800 on Floral (18:1 ratio)
├─ Button: Gray-800 on Amber-200 (10:1 ratio)
├─ Links: Sufficient contrast
└─ WCAG AA compliant
```

## Loading States

```
Initial Load:
└─ Show: "Loading moments..."

No Data:
└─ Show: "No moments yet. Check back soon!"

Loaded:
└─ Show: Hero + Moment Blocks + CTA
```

---

This visual structure ensures:
✅ Luxury feel with generous spacing
✅ Clear visual hierarchy
✅ Responsive across all devices
✅ Accessible to all users
✅ Engaging animations without distraction
✅ Professional wedding photography portfolio aesthetic
