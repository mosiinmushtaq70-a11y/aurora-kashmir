# AuroraLens — Location Dossier Page Audit
**Document Type:** UI/UX Audit & Redesign Specification  
**Page:** Site Intelligence Dossier (example: Kirkjufell, Iceland)  
**Prepared for:** AI Development Assistant  
**Version:** 1.0  
**Date:** March 2026

---

## 1. Page Purpose & Context

The Location Dossier is a deep-dive page opened when a user clicks a Live Activity Node card from the main landing page. It should function as a "tactical briefing" for aurora chasers and astrophotographers — combining live atmospheric data, ML forecast output, geographic intelligence, and photography logistics for a specific location.

**The single most important thing this page must do:** Show the user whether it's worth going outside tonight, and exactly what to expect if they do.

Currently, it fails that test. The live data and ML forecast are either buried or absent. The page spends too much time on atmospheric prose and too little time on the actionable product output.

---

## 2. Current Structure (Both Versions)

| # | Section | Status |
|---|---------|--------|
| 01 | Hero (full-bleed aurora photo + location name) | Keep |
| 02 | Intro narrative — "A sanctuary where the basalt" | Fix (broken animation) |
| 03 | Decorative glowing orb + snowflake icon | Remove |
| 04 | Live Intel Score / Atmospherics / Thermal stats | Move up + expand |
| 05 | Two CTAs — "Initiate Satellite Sync" + "Tactical Copilot" | Fix (rename Tactical Copilot) |
| 06 | Feature cards — Magnetic Band Convergence + Deep-Field Optical Clarity | Fix (add section header) |
| 07 | Field Archives — photo gallery | Fix (desktop layout) |
| 08 | Geologic Origin / Cinematic Legacy / Basalt Formation | Keep |
| 09 | Field Logistics text | Keep |
| 10 | "Load Interactive Sector Map (PRO)" — isolated button | Rebuild |
| 11 | Resource cards — Safety / Nav Pack / Local Satellite | Fix (icon inconsistency) |

**Critical missing sections:**
- Aurora probability forecast / KP timeline chart
- Best photography window (month/time of night)

---

## 3. Critical Issues — Fix Immediately

### Issue 01 — The Core Product is Absent (CRITICAL)

**What the problem is:**  
The landing page promises "ML-powered prediction with 98.4% precision." The user clicked into this dossier after seeing a card that said "HIGH KP-6, 92% Visibility." They expect to see a forecast. Instead, they find three stats in a plain card (score, cloud density, temperature) and no chart, no KP timeline, no probability curve, no predicted peak window. The actual ML output — the reason this product exists — is completely invisible on this page.

**What to build:**  
Add an Aurora Forecast Panel immediately below the hero. This should be a prominently designed section containing:

1. A KP-index probability curve for the next 48 hours (line chart, x-axis = time, y-axis = KP 0–9, threshold line at KP-5 labeled "Aurora likely")
2. A "Peak Window" highlight: the specific time window where probability is highest (e.g., "Best window: Tonight 23:00–02:30")
3. A confidence score or range (e.g., "87% confidence — based on 14 satellite inputs")
4. Cloud cover overlay on the same chart (secondary line or shaded area in a muted color)

The chart data comes from the existing ML forecast engine. This is not new data — it's just not being surfaced on this page.

**Why here:** The user's decision to go outside happens in the first 10 seconds of reading this page. If they don't see the forecast data immediately, they will leave.

---

### Issue 02 — Broken Scroll-Reveal Headline (CRITICAL)

**What the problem is:**  
The section headline reads "A sanctuary where the basalt" — the sentence ends mid-word. This is a scroll-triggered text reveal animation that captures mid-animation in static screenshots, but it also means the headline may appear broken to users on slow connections or with `prefers-reduced-motion` enabled.

The full sentence is likely "A sanctuary where the basalt meets the sky" or similar. The issue is that the reveal animation triggers on scroll, and the entire sentence should never be in a partially-revealed state.

**What to fix:**  
- Either make the headline static (no animation)  
- Or use a fade-in animation that starts from the complete sentence (opacity 0→1), never from partial text  
- Never animate character-by-character or word-by-word unless you handle the `prefers-reduced-motion` case by skipping directly to fully visible

**Additional note:** The headline also appears on mobile, where the same issue exists.

---

### Issue 03 — Live Data Is Buried Below the Fold (CRITICAL)

**What the problem is:**  
The Live Intel Score (46/100), Atmospherics (0% cloud density), and Thermal (−6.4°C ambient) are the most actionable numbers on this page. They appear after scrolling through: the hero, a large narrative section, and a lot of black space. By the time a user reaches them, they may have already lost interest.

**What to fix:**  
Move the live stats to directly below the hero — ideally as an inline data bar, not a separate scroll-away section. The stats should be visible within the first screen of content (above the fold on most desktop monitors).

**Recommended layout for data bar:**

```
[ LIVE INTEL SCORE: 46/100 ] | [ ATMOSPHERICS: 0% Cloud ] | [ THERMAL: −6.4°C ] | [ STATUS: HIGH KP-6 ]
```

This bar should use the same design as the Trust Bar recommended for the landing page — horizontal, full-width, subtle separator from the hero above.

**On mobile:** Stack as 2×2 grid instead of horizontal row.

---

### Issue 04 — "Tactical Copilot" Button Name (HIGH)

**What the problem is:**  
The secondary CTA button is labeled "TACTICAL COPILOT" with a sparkle icon. The product's AI assistant is named "Aura" on the landing page. Using a different name here creates brand fragmentation — users won't know "Tactical Copilot" is the same thing as "Aura."

**What to fix:**  
- Rename to: **"Ask Aura"** or **"Open Aura"** or **"Aura Copilot"**  
- Match the Aura branding (use same icon/logo as on landing page if one exists)  
- Style as a ghost/outlined button, subordinate to the primary "Initiate Satellite Sync" CTA
- The sparkles icon is generic — replace with whatever the Aura brand icon is from the landing page

---

### Issue 05 — Sector Map CTA Is Presented as an Afterthought (HIGH)

**What the problem is:**  
The "Load Interactive Sector Map (PRO)" feature is the primary upsell on this page — it's gated behind Pro and should feel like a premium teaser. Currently it's a single icon in a circle with text below it, floating in the middle of a vast black void. It looks like a placeholder, not a feature.

**What to build instead:**  
Replace the current button with a **locked preview card**:

- A blurred/darkened screenshot or illustrative preview of what the interactive sector map looks like (show the map, just blur it)
- A lock icon overlay in the center
- Text: "Interactive Sector Map — Pro Feature"
- Sub-text: "See magnetic flux zones, optimal shooting positions, and terrain-mapped aurora probability for Kirkjufell."
- CTA button: "Upgrade to Pro" (teal, consistent with brand)

This converts a dead-zone button into a meaningful conversion moment. Show the user what they're missing — don't just tell them there's something locked.

---

## 4. Section-by-Section Recommendations

### SECTION 01 — Hero ✅ Keep As-Is

Full-bleed aurora/mountain photograph. Large "Kirkjufell" heading with "THE CHURCH MOUNTAIN" eyebrow. "CLOSE DOSSIER" back button top-left. "SITE INTELLIGENCE / ICELAND // KIRKJUFELL" breadcrumb top-right.

This section is strong on both web and mobile. No changes needed.

---

### SECTION 02 — Live Data Bar 🔀 Move to Position 02 (was buried in middle)

Move the three stats immediately below the hero. Expand to include a fourth stat: current KP status badge.

**New layout:**
```
[ Intel Score: 46/100 ] | [ Cloud Density: 0% ] | [ Ambient Temp: −6.4°C ] | [ KP Status: HIGH KP-6 ]
```

The KP status should use the same colored badge system from the landing page node cards (green for STABLE, amber for HIGH, red for STORM).

---

### SECTION 03 — Aurora Forecast Panel 🆕 New Section (insert after live data bar)

See Issue 01 above for full specification.

**Section header:** None needed — the chart is self-explanatory with axis labels.

**Visual:** Dark card containing a line chart. Two lines:
- Primary: KP probability (teal, bold)
- Secondary: Cloud cover % (muted gray)

Horizontal threshold line at KP=5 with label "Aurora visible above this line."

X-axis: Next 48 hours in 6-hour increments (e.g., "Now", "6h", "12h", "Tonight", "Tomorrow", "48h")

A highlighted zone (slightly tinted teal background) over the peak window.

**Below the chart:** "Peak window: Tonight 23:00–02:30 · 87% confidence"

---

### SECTION 04 — Primary CTAs (repositioned after forecast data)

After showing the forecast, the user has enough information to act. Place both CTAs here:

**Primary:** "INITIATE SATELLITE SYNC" — teal pill button, full width on mobile, normal on desktop  
**Secondary:** "ASK AURA" — ghost/outlined button with Aura icon

The key change: placing these CTAs after the forecast rather than at the bottom of a stats card means the user is making a decision with context, not being prompted before they've seen the data.

---

### SECTION 05 — Intro Narrative ⚠️ Fix Headline

**Keep:** The three paragraphs of descriptive prose. The writing is good and gives the location character — "a landmark forged in fire and sculpted by ice" etc. This is the "editorial" voice that differentiates the product.

**Fix:** The broken headline animation. See Issue 02 above.

**Remove:** The decorative snowflake/asterisk icon and glowing orb on the right side of this section. They have no semantic value and look like unfinished placeholder elements.

---

### SECTION 06 — Site Advantages (Feature Cards) ⚠️ Add Context

**Current cards:**
- Magnetic Band Convergence — "High-density magnetic flux detected at the peak apex, accelerating ion collision probability by 14%."
- Deep-Field Optical Clarity — "Bortle Class 1 rating. Minimal atmospheric haze with particulate matter below 0.5 PPM."

These are excellent, specific, scientific features of Kirkjufell. But they appear with no section-level framing — the visitor doesn't know if they're reading general product features or location-specific advantages.

**Fix:** Add section eyebrow above both cards: `"WHY KIRKJUFELL"` or `"SITE ADVANTAGES"`. This instantly makes clear that these are properties unique to this location, not generic product features.

**On desktop:** Keep two-column layout.  
**On mobile:** The cards are currently taking up too much vertical space. Reduce the internal padding from the current value to ~24px top/bottom.

---

### SECTION 07 — Best Photography Window 🆕 New Section

**What it is:** A month-by-month or time-of-night guide to when Kirkjufell is at its best for aurora photography. This is deeply practical information for astrophotographers.

**Content:**

Optimal months: September–March (aurora season at Kirkjufell's latitude 64.9°N)  
Optimal time of night: 21:00–03:00 local time  
Best conditions: New moon phase, KP ≥ 4, cloud cover < 20%

**Visual approach:** A simple 12-month calendar strip with each month colored from muted (June/July — no aurora, perpetual daylight) to bright teal (October/November/February — peak probability). Simple, scannable, directly useful.

**Why this matters:** A user planning a trip in 3 months wants to know if December is better than January for Kirkjufell specifically. No aurora app currently shows this well.

---

### SECTION 08 — Field Archives ⚠️ Fix Desktop Layout

**Current issue (web):** Photos are left-aligned in a vertical stack, leaving the entire right half of the desktop viewport empty.

**Fix for desktop:** Change to a 2-column masonry-style grid. Alternate between wider and narrower photos. Add a right-side metadata panel alongside each image showing:
- Capture date
- Camera settings (ISO, shutter speed, aperture)
- Photographer credit (if available)
- KP index at time of capture

This transforms the gallery from a simple photo stack into a reference archive that reinforces the "scientific intelligence" positioning of the product.

**Mobile:** Current single-column layout is correct. Keep as-is.

---

### SECTION 09 — Geologic & Cultural Info ✅ Keep, Minor Enhancement

**Current content:** Three columns — Geologic Origin (Nunatak formation), Cinematic Legacy (Game of Thrones location), Basalt Formation (volcanic rock layers).

**Keep:** Everything. The information is accurate and interesting.

**Minor enhancement:** The "Game of Thrones — Arrowhead Mountain" fact is a massive hook for non-expert visitors. It's currently presented as one equal column among three. Consider giving it slightly more visual weight — a pull-quote style treatment or an inline image reference. This is free engagement.

---

### SECTION 10 — Field Logistics ✅ Keep Text, ❌ Rebuild Map CTA

**Keep:** The intro text about Snæfellsnes Peninsula access requirements.

**Rebuild:** The sector map CTA. See Issue 05 above for the full locked preview card specification.

---

### SECTION 11 — Resource Downloads ⚠️ Fix Icon

**Keep:** Content and layout. Three cards (Snæfellsnes Safety, Digital Navigation Pack, Local Satellite) are useful and appropriately placed.

**Fix:** The Local Satellite card is using an incorrect/inconsistent icon. Replace with a proper satellite dish or signal icon matching the shield (Safety) and download-arrow (Navigation Pack) style. All three icons should come from the same icon family at the same weight.

---

## 5. Recommended Final Section Order

```
01  Hero                              [keep]
02  Live Data Bar                     [move up from position 4]
03  Aurora Forecast Panel             [NEW — KP chart + peak window]
04  CTAs — Satellite Sync + Ask Aura  [reposition + rename]
05  Intro Narrative                   [fix headline animation, remove orb]
06  Site Advantages                   [add section eyebrow]
07  Best Photography Window           [NEW]
08  Field Archives                    [fix desktop layout]
09  Geologic & Cultural Info          [keep]
10  Field Logistics + Sector Map      [rebuild map CTA as locked preview card]
11  Resource Downloads                [fix icon]
```

---

## 6. Design Consistency Notes

All new sections must match the existing design system:

**Colors:** Same palette as landing page (`#00F5C4` teal accent, `#0A0E1A` dark bg, `#9CA3AF` muted text)

**Chart styling for Forecast Panel:**
- Background: `rgba(255,255,255,0.03)` card on dark base
- Primary line: `#00F5C4` (teal) — 2px stroke
- Secondary line (cloud cover): `rgba(156,163,175,0.5)` — 1px dashed
- Threshold line: `rgba(255,255,255,0.2)` — 1px dotted, labeled
- Highlighted zone: `rgba(0,245,196,0.06)` teal tint fill

**Photography Window calendar:**
- Off-season months: `rgba(255,255,255,0.05)`
- Peak months: `rgba(0,245,196,0.15)` to `rgba(0,245,196,0.4)` (proportional to probability)
- Text labels: Month abbreviations in `#9CA3AF`

---

## 7. Mobile-Specific Notes

1. **Stats bar (Section 02):** Use 2×2 grid (Intel Score + Cloud top row, Temp + KP Status bottom row)
2. **CTAs (Section 04):** Both buttons full-width, stacked. "Initiate Satellite Sync" on top.
3. **Forecast chart (Section 03):** Compress x-axis to show only "Now / 6h / 12h / Tonight / 48h" labels (5 labels, not 8). Chart height: 180px on mobile.
4. **Photography Window calendar (Section 07):** On mobile, show as a 6×2 grid (two rows of 6 months) instead of 1×12 horizontal strip.
5. **Field Archives (Section 08):** Single column. Keep large rounded corners on photos (they look great).
6. **Sector Map locked preview (Section 10):** Show a vertically oriented preview card instead of horizontal. Same lock icon overlay.

---

## 8. Notes for the AI Developer

- **The dossier page is a template, not a one-off.** Kirkjufell is one node. Tromsø, Fairbanks, and every other active location will use this same template. Every change here applies to all location pages. Design with data variability in mind — different locations will have different KP scores, different optimal months, different geologic stories.

- **The Aurora Forecast Panel needs real data.** The KP chart must pull from the same API/data layer that powers the Live Intel Score. Do not hardcode example values — connect to the live forecast engine.

- **"Initiate Satellite Sync" needs a defined action.** It's unclear what this button does when clicked. Does it subscribe to alerts for this location? Does it add it to a watchlist? This should be defined before launch. If it subscribes to push/email alerts for this location, the button copy should be clearer: "Subscribe to Kirkjufell Alerts" or "Watch This Location."

- **The back navigation matters.** "Close Dossier" with a left arrow exists on both versions. On mobile, ensure this button doesn't overlap with page content while scrolling (it appears to be fixed position — verify it doesn't block text).

- **Accessibility:** The aurora photography content involves low-contrast photography against dark backgrounds. Ensure all text overlaid on photos meets WCAG AA (4.5:1 contrast ratio minimum). The current white text on dark aurora photos likely passes, but verify programmatically.

---

*End of audit brief. The most impactful single change is adding the Aurora Forecast Panel (Issue 01) — it transforms this page from an editorial piece into an actual product page.*
