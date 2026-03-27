# Design System Specification: The Ethereal Observer

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Celestial Lens."** 

We are moving away from the "dashboard" aesthetic and toward a "viewfinder" experience. This system treats the screen not as a container for data, but as a window into the night sky. To break the "template" look, we utilize **Intentional Asymmetry**: placing high-density data clusters against vast expanses of empty `surface` space. We favor overlapping elements—where glass cards partially obscure bioluminescent gradients—to create a sense of physical atmosphere and three-dimensional depth.

## 2. Color & Atmospheric Depth
Our palette is rooted in the "Midnight Tier." We avoid pure black (#000) to maintain a soft, premium inkiness that allows our glow effects to feel integrated rather than "pasted on."

### Surface Hierarchy & Nesting
Traditional borders are heavy and digital. We use **Tonal Transitions** to define space:
*   **Base Layer:** `surface` (#10131a) – The infinite night sky.
*   **Sectioning:** Use `surface_container_low` (#191c22) for large structural areas.
*   **Floating Elements:** Use `surface_container_high` (#272a31) for elevated context.
*   **The Glass Rule:** For foreground interactions, use `bg-[#080B11]/40` with `backdrop-blur-2xl`. This "True Glass" effect allows the `secondary` (Teal) and `tertiary` (Purple) accents to bleed through from the background.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders for sectioning. Use the Spacing Scale (specifically `12` or `16`) to create distance between content blocks. If a boundary is required, it must be achieved by a shift from `surface_container` to `surface_container_low`.

## 3. Typography: Editorial Authority
We blend the precision of **Inter** with the architectural strength of **Manrope** to create a high-end magazine feel.

*   **Display & Headlines (Manrope):** Use `display-lg` for hero stats (e.g., KP-Index). Apply `tracking-tight` and `font-semibold`. This conveys a "Tesla-esque" technical authority.
*   **Body Copy (Inter):** All paragraphs must use `font-light` with `leading-relaxed` using the `on_surface_variant` (#bac9cc) token. This ensures the text feels "etched" into the glass rather than printed on it.
*   **Labels (Inter):** Use `label-md` in `all-caps` with `tracking-widest` for secondary metadata to mimic high-end fashion editorial layouts.

## 4. Elevation & Depth
Depth is our primary tool for storytelling. We simulate the layered atmosphere of the Aurora.

*   **The Layering Principle:** Place `surface_container_lowest` (#0b0e14) elements inside a `surface_container` (#1d2026) parent to create a "recessed" well effect. This is ideal for input fields or data readouts.
*   **Ambient Shadows:** Use a custom shadow: `shadow-[0_20px_50px_rgba(0,0,0,0.3)]`. The shadow should never be gray; it should feel like a deep navy occlusion.
*   **The Ghost Border:** For accessibility on glass cards, use `border-white/5` (1px). This is the only acceptable "line" in the system—it should be felt, not seen.

## 5. Components & Primitives

### Buttons
*   **Primary:** A soft gradient from `secondary` (#44e2cd) to `secondary_container` (#03c6b2). No border. `rounded-full`.
*   **Tertiary (Ghost):** `text-primary` with no background. On hover, a subtle `bg-white/5` fill appears.

### Cards (The "Glass" Container)
*   **Styling:** `bg-[#080B11]/40`, `backdrop-blur-2xl`, `rounded-xl` (3rem). 
*   **Content:** No dividers. Separate the header from the body using a `3.5rem` (10) vertical gap.

### Input Fields
*   **Styling:** `bg-surface_container_lowest`, `rounded-md` (1.5rem), `border-white/5`.
*   **Focus State:** The border transitions to `primary` (#c3f5ff) at 30% opacity with a soft `primary` outer glow.

### Celestial Components (App-Specific)
*   **Bioluminescent Pulse:** A `secondary_fixed_dim` dot that uses a CSS scale animation to indicate "Live" Aurora activity.
*   **Atmospheric Slider:** A range input where the track is a gradient from `surface_container` to `primary`, and the thumb is a `backdrop-blur-md` circle.

## 6. Do's and Don'ts

### Do
*   **Embrace Negative Space:** If a screen feels crowded, double the padding using the `20` (7rem) spacing token.
*   **Use Asymmetric Grids:** Align a large headline to the far left and the supporting data to the far right, leaving the center "empty" to show the background aurora imagery.
*   **Layering:** Place `tertiary` (Purple) glowing orbs in the background behind glass cards to create "Atmospheric Depth."

### Don't
*   **No Pure White Backgrounds:** Never use white for anything other than high-contrast text or 5% opacity borders.
*   **No Standard Grids:** Avoid the "3-column card row" look. Vary card widths (e.g., 60% / 40%) to maintain an editorial feel.
*   **No Harsh Shadows:** If a shadow looks like a "drop shadow," it is too dark. It should look like "ambient occlusion."