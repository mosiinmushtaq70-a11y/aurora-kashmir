# Design System: Focus Mode & Bioluminescent Precision

## 1. Overview & Creative North Star
**Creative North Star: The Celestial Lens**
This design system is not a utility; it is an immersive environment. We are moving away from the "app-in-a-box" aesthetic toward a high-end, editorial experience that feels like a professional photography studio at midnight. By blending the precision of Tesla’s interface with the tactile elegance of Apple’s glass architecture, we create a "Focus Mode" that eliminates distraction through depth rather than flat minimalism.

The system breaks the "template" look by using **intentional asymmetry** and **tonal layering**. We rely on the interplay between bioluminescent accents and heavy backdrop blurs to guide the eye, ensuring the AI Photography Assistant feels like a living, breathing co-pilot rather than a static tool.

---

## 2. Colors & Surface Philosophy
The palette is rooted in the deep shadows of a darkroom, punctuated by "electrical" accents that signify AI activity.

### The "No-Line" Rule
**Strict Mandate:** Traditional 1px solid borders are prohibited for sectioning. 
Structural boundaries must be defined solely through background color shifts. For example, a `surface-container-low` component should sit on a `surface` background to create a "soft-edge" distinction. If a container needs to be more prominent, use a shift in the `surface-container` tiers rather than adding a stroke.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of obsidian glass.
*   **Base Layer:** `surface` (#10131a)
*   **Primary Workspaces:** `surface-container-low` (#191c22)
*   **Interactive Cards:** `surface-container` (#1d2026)
*   **Floating Modals/Popovers:** `surface-container-highest` (#32353c)

### The "Glass & Gradient" Rule
To achieve the "Bioluminescent" vibe, main CTAs and progress indicators should utilize a gradient transition from `primary` (#c3f5ff) to `primary-container` (#00e5ff). Floating elements must use **Heavy Glassmorphism**: a combination of `surface-variant` at 40% opacity and `backdrop-blur-3xl`.

---

## 3. Typography: Editorial Elegance
We use **Manrope** to bridge the gap between technical precision and high-fashion editorial.

*   **Display (Large/Medium):** Reserved for hero AI insights or "Focus" headings. Use tight letter-spacing (-0.02em) to create an authoritative, "locked-in" feel.
*   **Headlines & Titles:** These are the anchors of the page. Use `headline-sm` (1.5rem) for section headers to provide a clear, sophisticated hierarchy.
*   **Body & Labels:** Use `body-md` (0.875rem) for most descriptions. The high contrast between `display-lg` (3.5rem) and `body-sm` (0.75rem) is intentional—it mimics the layout of a premium photography monograph.

---

## 4. Elevation & Depth
In "Focus Mode," depth is the primary signifier of importance.

*   **The Layering Principle:** Stacking surface tiers (e.g., placing a `surface-container-lowest` card on a `surface-container-low` section) creates a natural lift.
*   **Ambient Shadows:** For floating elements, use a "Cyan-Tinted Glow" rather than a grey shadow. Use `primary-container` at 8% opacity with a blur radius of 40px–60px. This mimics the light emitted from the bioluminescent UI elements.
*   **The Ghost Border:** If a boundary is required for accessibility, use a "Ghost Border": the `outline-variant` token at **15% opacity**. This provides a whisper of a container without breaking the glass aesthetic.
*   **Corner Radii:** Apply `xl` (3rem) for the main modal and `lg` (2rem) for internal cards. The generous rounding communicates "High-End Consumer Tech" and softens the "Professional" rigidity.

---

## 5. Components

### Buttons
*   **Primary (Bioluminescent):** Gradient from `primary` to `primary-container`. Text: `on-primary` (#00363d). Roundedness: `full`.
*   **Secondary (Glass):** Background: `surface-container-high` at 50% opacity with `backdrop-blur-md`. Border: Ghost Border (15% opacity).
*   **Tertiary:** Ghost text using `primary` color. No background until hover (then use `surface-container-low`).

### Input Fields
*   **Style:** Minimalist under-lines are forbidden. Use a `surface-container-lowest` fill with `rounded-md` corners.
*   **Focus State:** The border should not "light up" globally; instead, use a subtle glow effect (`primary` shadow at 10% opacity) to indicate the active field.

### Cards & Lists
*   **The "No-Divider" Rule:** Forbid the use of divider lines. Separate content using the `Spacing Scale`: `8` (2.75rem) for major sections and `4` (1.4rem) for sub-content.
*   **Image Previews:** All photography previews must have `rounded-lg` (2rem) corners to match the UI language.

### Specialized Component: The Focus Meter
An AI-driven gauge using a `secondary` (#67d9c9) to `primary-container` (#00e5ff) conical gradient, housed in a `surface-container-highest` track with a `backdrop-blur-3xl` mask.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical layouts. Place the "Focus Meter" off-center to create visual tension and interest.
*   **Do** embrace negative space. Use the `20` (7rem) spacing token to let hero photography breathe.
*   **Do** use `primary-fixed-dim` for inactive AI states to maintain the "Midnight" atmosphere without losing legibility.

### Don't
*   **Don't** use pure white (#FFFFFF). All "white" text should be `on-surface` (#e0e2eb) to reduce eye strain in Focus Mode.
*   **Don't** use sharp corners. Anything less than `sm` (0.5rem) will feel too "legacy software" and break the Tesla-meets-Apple vibe.
*   **Don't** use standard drop shadows. If it doesn't look like it's glowing or floating on glass, it doesn't belong in this system.