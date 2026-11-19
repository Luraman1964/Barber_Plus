---
name: Heritage Warmth & Precision
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#d0c5af'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#99907c'
  outline-variant: '#4d4635'
  surface-tint: '#e9c349'
  primary: '#f2ca50'
  on-primary: '#3c2f00'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#735c00'
  secondary: '#e9c176'
  on-secondary: '#412d00'
  secondary-container: '#604403'
  on-secondary-container: '#dab36a'
  tertiary: '#e2c9b9'
  on-tertiary: '#3c2d22'
  tertiary-container: '#c6ae9f'
  on-tertiary-container: '#524135'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#ffdea5'
  secondary-fixed-dim: '#e9c176'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4201'
  tertiary-fixed: '#f7decd'
  tertiary-fixed-dim: '#dac2b2'
  on-tertiary-fixed: '#26190f'
  on-tertiary-fixed-variant: '#544337'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Newsreader
    fontSize: 40px
    fontWeight: '500'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Newsreader
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
  title-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 26px
    letterSpacing: 0.01em
  title-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.08em
  label-sm:
    fontFamily: Manrope
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-tablet: 1.5rem
  gutter-desktop: 2rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system embodies a synthesis of classical barbershop heritage and high-precision contemporary grooming. Designed primarily as a mobile-first Progressive Web App (PWA), the experience radiates warmth, masculine refinement, craftsmanship, and quiet confidence.

The visual direction draws from **Refined Vintage Modernism**:
- Deep, atmospheric carbon backgrounds with textural depth reminiscent of charred timber and aged leather.
- Warm amber-gold accents reflecting polished brass fittings, tonic bottles, and vintage shear engravings.
- Tactile, quiet interactions designed for deliberate pacing, ensuring appointments and service discovery feel like entering an upscale private club.
- Architectural restraint: content is framed cleanly, avoiding gratuitous skeuomorphism in favor of disciplined hierarchy, sharp spatial rhythm, and authentic material tones.

## Colors

The color palette anchors firmly in deep charcoal blacks, walnut undertones, and glowing aged golds, highlighted by soft ivory text to eliminate abrasive white contrast.

- **Primary (`#D4AF37`)**: Antique Gold. Used for high-priority actions, verified indicators, active selection rings, and key milestones.
- **Secondary (`#C5A059`)**: Muted Amber Brass. Serves as supporting accenting for sub-headers, icon treatments, hover outlines, and category tags.
- **Tertiary (`#3A2B20`)**: Deep Bog Oak / Dark Walnut. Acts as warm contextual fill behind elevated cards, badges, and segmented tab tracks.
- **Neutral Core (`#121212`)**: Charcoal Base. A non-absolute black that preserves warmth and minimizes OLED banding.
- **Ivory Neutral (`#F7F4EA`)**: Applied to all primary text labels to deliver an editorial, parchment-like contrast against dark surfaces.
- **Muted Smoke (`#8C857B`)**: Applied to secondary timestamps, durations, and structural metadata.

## Typography

The type system pairs **Newsreader**—a scholarly, transitional serif that evokes bespoke barbershop tradition and artisanal pedigree—with **Manrope**, an ultra-clean geometric humanist sans-serif optimized for functional reading on small mobile screens.

- **Editorial Serifs (Newsreader)**: Reserved strictly for brand moments, category introductions, service titles, and barber names.
- **Functional Sans (Manrope)**: Powers booking dates, price tags, duration badges, validation copy, legal disclaimers, and interactive button text.
- **Tracking & Proportion**: Display headlines use subtle negative tracking (`-0.01em` to `-0.02em`) for a curated editorial finish. Labels and utility tags leverage generous uppercase tracking (`0.08em` to `0.1em`) to maintain sharp legibility against dark backdrops.

## Layout & Spacing

The layout operates on a fluid, touch-centric 4-column system on mobile devices (scaling to 8 columns on tablets and 12 columns on desktop viewports).

- **Margins & PWA Safety**: Base mobile canvas uses a `1rem` (16px) margin, with explicit bottom safe-area insets (`env(safe-area-inset-bottom)`) accommodating iOS Safari and Android navigation gestures.
- **Rhythm**: Component spacing strictly adheres to an 8pt architectural rhythm, with `0.5rem` (8px) used for metadata groups, `1rem` (16px) separating distinct interactive items, and `1.5rem` to `2.5rem` defining section divides.
- **Vertical Hierarchy**: Dense vertical stacking is balanced by breathing space around high-value calls to action and service pricing, ensuring one-handed ergonomic reach on mobile devices.

## Elevation & Depth

Visual hierarchy uses subtle surface shifts rather than high-contrast shadows.

- **Tonal Layers**: The canvas starts at Base Neutral (`#121212`). Cards and list items sit on Surface Level 1 (`#1A1918`). Modals and bottom sheets rest on Surface Level 2 (`#242220`).
- **Low-Contrast Metallic Borders**: Surfaces are defined by soft 1px hairline borders (`rgba(212, 175, 55, 0.15)`), eliminating blunt cuts while retaining vintage warmth.
- **Ambient Shadowing**: Floating actions and the booking modal utilize deep, warm ambient shadows: `0 12px 32px -4px rgba(0, 0, 0, 0.7), 0 2px 8px rgba(212, 175, 55, 0.05)`.
- **Glassmorphic Overlays**: App bar navigation and active sticky summaries apply a dark walnut backdrop blur (`rgba(18, 18, 18, 0.85)` with `backdrop-filter: blur(12px)`) to keep contextual continuity during scrolling.

## Shapes

The shape system adopts a **Soft (`1`)** approach (base radius: `0.25rem` / 4px, `rounded-lg`: `0.5rem` / 8px, `rounded-xl`: `0.75rem` / 12px).

- Sharper corners pay homage to straight razors, beveled mirrors, and traditional wooden cabinetry.
- Avoid spherical or pill-shaped buttons; interactive buttons and cards maintain tailored, crisply radiused profiles (`0.5rem`).
- Avatars and status pills feature controlled corners or classic oval silhouettes that preserve structure over playful roundness.

## Components

### Service List Item
- **Layout**: Two-column row with title, duration, and brief note on the left; price and selection toggle on the right.
- **Styling**: Divided by a hairline border (`rgba(212, 175, 55, 0.12)`). Active state applies a left border highlight in Primary Gold (`#D4AF37`, 3px).
- **Price Treatment**: Highlighted in `title-md` using Antique Gold; duration displayed in `label-sm` using Muted Smoke (`#8C857B`).

### Barber Cards with Status
- **Structure**: Vertical card containing a portrait frame, barber name in `Newsreader` (`headline-md`), specialties, and a live availability indicator.
- **Status Indicator**:
  - *Disponible*: Soft emerald halo with a 6px solid dot and label in Ivory.
  - *En servicio*: Muted amber dot with subtle static glow.
  - *Fuera de turno*: Charcoal gray dot.
- **Container**: Bordered with a 1px contour of `rgba(212, 175, 55, 0.2)` on Surface Level 1.

### Interactive WhatsApp Booking Modal
- **Behavior**: Slides up from the bottom as an ergonomic mobile sheet with a top grab handle.
- **Flow**:
  1. Selected service and barber recap summary.
  2. Day/Time picker with horizontal pill scroll.
  3. Customer details (Name, Phone).
  4. Instant preview of the structured WhatsApp message.
- **Action Button**: Primary button labeled *"Confirmar Reserva por WhatsApp"* with gold-filled background, bold carbon text, and a WhatsApp brass icon.

### Form Inputs & Selectors
- **Default State**: Background `#181716`, border 1px `rgba(212, 175, 55, 0.2)`, text Ivory.
- **Focus State**: Border shifts to `#D4AF37`, subtle inner glow. Labels float above with `label-sm` uppercase styling.

### Colombian Data Privacy Badge (Ley 1581 de 2012)
- **Placement**: Integrated into the booking confirmation step directly above the primary submission button and in the app drawer.
- **Appearance**: Enclosed in a compact shield pill with a 1px border. Displays an amber lock icon, accompanied by:
  *"Tratamiento de datos conforme a la Ley 1581 de 2012 de Colombia. Tus datos están protegidos."*
- **Typography**: Handled in `body-sm` (`11px`) with an interactive link to view detailed habeas data policies.

### Footer & Credits
- **Layout**: Centered, discreet layout at the base of the primary scroll view.
- **Content**: Subtle brand seal followed by the mandatory attribution:
  *"Diseño y desarrollo por Luis Rafael Martinez Angulo"*.
- **Style**: Styled in `body-sm` using Muted Smoke (`#8C857B`) with hover transition to Antique Gold (`#D4AF37`).