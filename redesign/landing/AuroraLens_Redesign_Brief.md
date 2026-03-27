# AuroraLens — Landing Page Redesign Brief
**Document Type:** Full Implementation Specification  
**Prepared for:** AI Development Assistant  
**Project:** AuroraLens Marketing Website  
**Version:** 1.0  
**Date:** March 2026

---

## 1. Project Context

AuroraLens is a celestial monitoring platform that uses real-time atmospheric telemetry and machine learning (XGBoost engine) to predict aurora borealis events with 98.4% precision. The service provides live KP-index tracking, global observational hotspot nodes, hyper-local atmospheric density modeling, satellite uplink data, and an AI astrophotography assistant called "Aura."

The current landing page has all the right content but suffers from a **sequencing problem**: it shows live product data before the visitor understands what the product does or why they should trust it. This brief documents the full recommended restructure — what to change, why, where each section goes, and how to implement each new/moved section.

---

## 2. Core Problem Being Solved

### The Visitor's Mental Journey (What It Should Be)

```
"What is this?"  →  "How does it work?"  →  "Why should I trust it?"  
→  "Show me proof it works"  →  "What does it do for me specifically?"  
→  "What does it cost?"  →  "OK, I'm in."
```

### Current Flow (Broken Journey)

```
"What is this?" (Hero)  →  "Here's live data from Iceland" (???)  
→  "Oh, here's how it works" (too late)  →  Trust signals (too late)  
→  CTA (visitor already lost)
```

The fix is to front-load understanding and trust, then deliver proof, then convert.

---

## 3. Complete Section-by-Section Specification

### SECTION 01 — Hero ✅ Keep, Minor Edits

**Current State:** "Track the Aurora Anywhere" — dark background, bold typography, teal accent on "AURORA", search input, floating planet orbs.

**What to Keep:**
- The headline and subheadline copy
- The search input with coordinates/city placeholder
- The overall dark color scheme and teal (`#00F5C4` / cyan-400) accent
- The "Join Observer" CTA button in the nav

**What to Change:**

1. **Replace the floating planet orbs** with a functional visual. The orbs look decorative and communicate nothing about the product. Replace with one of:
   - An animated KP-index ring/gauge (SVG with CSS animation, showing a live-style KP value ticking up)
   - A subtle aurora shimmer effect using layered CSS gradients animating opacity (green/teal hues, very subtle, behind the headline text)
   - A mini globe with pulsing dots at aurora hotspot coordinates (Three.js or CSS only)

2. **Mobile spacing fix:** On mobile (< 768px), there is a large dead black gap between the subtitle text and the search input. Reduce the hero section `min-height` or adjust vertical padding so the content is vertically tighter. The gap appears to be caused by `min-height: 100vh` with content not filling it — add `display: flex; align-items: center;` or adjust padding.

**Implementation note:** This section already exists. These are targeted edits, not a rebuild.

---

### SECTION 02 — Trust Bar 🆕 NEW SECTION (Insert after Hero)

**Purpose:** The hero makes a bold claim ("98.4% precision"). Visitors trained by the internet will be skeptical. A trust bar immediately below the hero fold converts that skepticism into curiosity by backing the claim with hard numbers before the visitor scrolls anywhere.

**Design:**  
A single horizontal row of 3–4 stat blocks, spanning full width, with a subtle top/bottom border separating it from the hero and the next section. Background should be slightly lighter than the hero (`#0D1117` → `#111827` or similar — keep it dark, just distinguish it).

**Content (suggested stats — update with real values):**

| Stat | Label |
|------|-------|
| 12,000+ | Active Observers |
| 98.4% | Forecast Accuracy |
| 60 Years | Telemetry Data |
| 24/7 | Live Satellite Uplink |

**Layout:**
```
[ 12,000+ Active Observers ] | [ 98.4% Forecast Accuracy ] | [ 60 Years Telemetry ] | [ 24/7 Satellite Uplink ]
```

Each block:
- Large number: `font-size: 2rem; font-weight: 700; color: #00F5C4` (teal accent)
- Label: `font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; color: #9CA3AF` (muted gray)
- Vertical dividers between blocks (`border-right: 1px solid rgba(255,255,255,0.1)`)
- On mobile: 2×2 grid

**Why this works:** Linear, Vercel, Stripe, and Resend all use a stats bar immediately below their hero. It transitions the page from "marketing claim" to "verifiable product" without requiring the visitor to scroll deep.

---

### SECTION 03 — How It Works 🔀 MOVED (was Section 3, now Section 3)

**Current State:** Three cards — TARGET (01), ANALYZE (02), DEPLOY (03) — each with a custom icon, a step number, a bold title, and a short description.

**Why It Moves Up:** Before showing live aurora data from Kirkjufell, the visitor needs a mental model of what this product actually does. The current flow shows proof before explanation. Swapping these two sections means: "Here's the 3-step process" → "Here's live proof it's running right now." That's a logical narrative arc.

**What to Keep:**
- The three steps and their descriptions
- The dark card aesthetic
- The custom target/scan/alert icons

**What to Change:**

1. **Add a visual connector between cards.** Currently the three cards look like three unrelated features. Add a horizontal dashed line or a numbered progress connector between them to reinforce that these are sequential steps, not parallel features. On desktop: a horizontal line through the card midpoints. On mobile: a vertical line on the left side.

2. **Make the icons animated on hover.** The TARGET crosshair could rotate slightly. The ANALYZE scanner ring could pulse. The DEPLOY bell could ring (brief CSS keyframe). This adds life without being distracting.

3. **Update the section header.** Consider changing the section label from a generic heading to something that frames it as a user journey, e.g.:
   - Section eyebrow: `"HOW IT WORKS"`
   - Main heading: `"From Any Location to Accurate Prediction — in Seconds"`

**Implementation note:** The section content is already built. The changes are CSS-level additions (connector line, hover animations) plus a heading copy update. Moving the section in the DOM is the main task.

---

### SECTION 04 — Live Activity Nodes 🔀 MOVED (was Section 2, now Section 4)

**Current State:** Carousel of global observational hotspot cards — Kirkjufell Iceland (HIGH KP-6, 92% Visibility), Tromsø Norway (STABLE KP-5, 76% Visibility), Fairbanks Alaska (STORM KP-8, 100% Visibility). Each card has a real aurora photograph, location name, coordinates, status badge, and last-updated timestamp.

**Why It Moves Down:** After the visitor understands the 3-step process (Section 03), seeing live data from Iceland and Norway now feels like *proof* — "Oh, the system is actually running right now, tracking these locations." Before the explanation, it just looks like a photo carousel with confusing technical labels (KP-6? What does that mean?).

**What to Keep:**
- All card content and real photography
- The status badge system (HIGH / STABLE / STORM with color coding)
- The carousel navigation arrows
- The "Updated Xm ago" timestamp

**What to Change:**

1. **Add a brief KP-index tooltip or legend.** First-time visitors don't know what KP-6 means. Add a small `(?)` icon next to any KP badge that, on hover/tap, shows a tooltip: `"KP-index: planetary K-index measuring geomagnetic activity. Scale 0–9. KP-5+ = visible auroras."` This is a one-line change that dramatically reduces confusion.

2. **Consider a map view toggle.** Optionally add a toggle button: `[Cards] [Map]`. In Map view, show a dark-themed world map (Mapbox dark style or a static SVG world map) with pulsing dots at each active node location. This is optional but would be visually stunning and differentiated.

3. **On desktop, show all three cards without a carousel** (they already fit). Reserve the carousel for mobile only (single-card swipe). The desktop carousel arrows are currently present but unnecessary if all three fit.

---

### SECTION 05 — Engineering Features ✅ Keep, Small Enhancements

**Current State:** Section header "Scientific Precision. Consumer Elegance." with four feature blocks:
- 60 Years of Telemetry (with progress dots)
- 24/7 Live Satellite Uplink (large number display)
- XGBoost ML Engine (text only)
- Hyper-Local Atmosphere Density (bar chart)

**What to Keep:** All content, the overall layout, the section eyebrow "ENGINEERING EXCELLENCE."

**What to Change:**

1. **24/7 Uplink block feels incomplete.** It's just the number "24/7" floating in a card. Add a small animated SVG: a satellite icon orbiting a ground station dot in a circular path (CSS animation, very subtle, ~4s loop). This makes the "live" claim feel real.

2. **XGBoost ML Engine block has no visual.** It's just text. Add a small sparkline or decision tree visual — even a simple SVG of branching lines (3 levels deep) would visually represent "ML model" without being inaccurate.

3. **Hyper-Local Atmosphere Density has a bar chart** that looks good. Consider making the bars animate in on scroll (IntersectionObserver). This is a minor enhancement.

4. **60 Years of Telemetry has progress dots** (stepper indicator) suggesting there are more slides/facts. Ensure this is functional. If it's decorative, remove it to avoid confusing users who will click and get nothing.

---

### SECTION 06 — Social Proof / Testimonials 🆕 NEW SECTION

**Purpose:** Engineering features appeal to the rational brain. Testimonials appeal to the social brain. After the technical case is made, human voices validate the decision emotionally. This is where fence-sitters get converted.

**Why Here:** Classic landing page structure (used by Airbnb, Notion, Stripe): Features → Social proof → Pricing → CTA. Placing testimonials after features and before pricing means the visitor arrives at the pricing section already convinced.

**Design:**

A 3-column card grid on desktop, single column on mobile. Dark card background (matching the existing card style). Each card:

```
[Location photo or avatar — circular, 48×48px]
"Quote text in italics, max 2 sentences."
— Name, Location / Title
[Star rating optional]
```

**Suggested personas (write placeholder copy, client to replace with real quotes):**

1. **Astrophotographer, Tromsø Norway**  
   *"AuroraLens predicted a KP-7 storm 18 hours before any other service. I had my camera set up and captured the best shot of my career."*  
   — Lena H., Astrophotographer

2. **Aurora Tour Guide, Rovaniemi Finland**  
   *"My clients trust me because I trust AuroraLens. The hyper-local forecasts account for cloud cover in a way generic apps never did."*  
   — Mikko V., Northern Lights Guide

3. **Amateur Astronomer, Fairbanks Alaska**  
   *"I've tried three other aurora trackers. None of them told me to look up at 2:14 AM and see a KP-8 storm. AuroraLens did."*  
   — James R., Amateur Astronomer

**Implementation:**  
If real testimonials aren't available yet, use `<!-- TODO: Replace with real testimonials -->` comment and ship the layout with placeholder text. The section structure should be built regardless.

**Section header:**
- Eyebrow: `"OBSERVER NETWORK"`
- Heading: `"Trusted by Aurora Chasers Worldwide"`

---

### SECTION 07 — Aura AI Assistant ✅ Keep, Enhancements

**Current State:** Dark card with headline "Don't just track it. Capture it." + "Meet Aura" description + "Chat with Aurora" CTA button + "Watch Preview" link. A partial chat interface visible on the right showing camera settings output and a user message about Tromsø.

**What to Keep:**
- The headline and the concept — this is one of the strongest sections
- The "Chat with Aurora" primary CTA
- The "Watch Preview" secondary action
- The section divider / card layout

**What to Change:**

1. **The chat mockup is too dark and illegible.** The chat interface on the right side of the card has very low contrast — the message bubbles are barely distinguishable from the card background. Lighten the chat mockup container by 10–15% (use `rgba(255,255,255,0.06)` instead of `rgba(255,255,255,0.02)` for message bubble backgrounds). Ensure the text inside is `color: #E5E7EB` or brighter.

2. **Show two exchanges in the chat, not one.** Currently only one user message is visible. Show:
   ```
   AURA: "Recommended ISO for tonight: 1600. Shutter 15s. f/2.8."
   YOU: "What's the best spot near Tromsø for tonight?"
   AURA: "Storfjord Valley has 94% clear sky until 02:30. KP forecast peaks at 6.2 around midnight."
   ```
   This shows the AI's capability more clearly — it answers a location question AND provides camera settings. Two exchanges = much stronger product demo.

3. **Add a subtle typing indicator animation** (three bouncing dots) in the Aura response bubble to reinforce that this is a live AI, not a screenshot.

---

### SECTION 08 — Pricing / Plans 🆕 NEW SECTION

**Purpose:** Without pricing, the visitor arrives at the final CTA ("Initiate Tracking Protocol") without knowing what they're committing to. If the product is paid, this creates drop-off at the most critical moment. If there's a free tier, the pricing section is actually a conversion asset — "free to start" is a powerful message.

**Why Here:** Pricing before the final CTA is the standard premium SaaS pattern (Linear, Vercel, Raycast all do this). The visitor has now seen the features, seen social proof, used or read about the AI — they're primed. Show them the offer.

**Suggested Tier Structure (adjust to actual business model):**

| Tier | Price | Key Features |
|------|-------|--------------|
| **Observer** (Free) | $0/mo | 3 location alerts, 48hr forecast, basic KP data |
| **Pro** | $9/mo | Unlimited locations, 7-day forecast, Aura AI, camera settings |
| **Research** | $29/mo | API access, historical data export, scientific KP datasets |

**Design:**

3-column card layout. Middle card (Pro) is highlighted:
- Slightly larger card scale or a teal border (`border: 1px solid #00F5C4`)
- "Most Popular" badge above it in teal
- Keep background consistent with other cards (don't over-style)

Each card:
- Tier name (bold, teal for Pro)
- Price per month
- Feature list (4–5 bullet points)
- CTA button: "Start Free" / "Get Pro" / "Contact Us"

**On mobile:** Stack vertically. Pro card goes first (most conversions come from the mobile-first tier).

**Section header:**
- Eyebrow: `"PLANS"`
- Heading: `"Start Observing for Free"`

---

### SECTION 09 — FAQ Accordion 🆕 NEW SECTION

**Purpose:** Every visitor who reaches the final CTA without converting has an unanswered objection. An FAQ section captures those objections and answers them before the visitor bounces. This is a proven high-ROI section for SaaS landing pages.

**Why Here:** Placed between pricing and the final CTA so that pricing questions, skepticism, and technical questions get resolved in the exact moment the visitor is deciding.

**Design:**  
A clean accordion component. Each item: question in a row with a `+` / `−` toggle icon, answer expands below with a CSS transition. Dark background, matching existing card aesthetics.

**Suggested Questions (client to refine):**

1. **Does AuroraLens work at my latitude?**  
   "AuroraLens covers all latitudes with aurora activity, including auroral zones in North America, Scandinavia, Iceland, Russia, and during high KP events, central Europe and the northern US."

2. **How is this different from SpaceWeather.com or Aurora Forecast apps?**  
   "Generic apps use NOAA's global KP-index. AuroraLens layers in local atmospheric density, cloud cover modeling, and terrain data for your exact GPS coordinates — not just your country."

3. **How far in advance can it predict an aurora event?**  
   "Our XGBoost model provides reliable 48-hour forecasts for all plans. Pro and Research plans include 7-day probabilistic forecasts with confidence intervals."

4. **Does Aura AI require a subscription?**  
   "Aura is available on the Pro plan and above. Free Observer accounts get limited Aura queries (3 per week)."

5. **Can I use AuroraLens data for scientific research?**  
   "Yes. The Research plan includes full API access and historical dataset exports going back 60 years (where available). Academic institutions contact us for institutional pricing."

---

### SECTION 10 — Urgency CTA ✅ Keep As-Is

**Current State:** Dark card with "The aurora is shifting." headline, "Don't miss the next peak." subtext in teal italic, and "INITIATE TRACKING PROTOCOL" button.

**Assessment:** This is an excellent final CTA. The copy is dramatic and product-specific. The button copy is distinctive and branded. Do not change this section — it works.

**Minor suggestions only:**
- Ensure the button has a hover state (scale + brightness lift)
- Consider adding a very subtle animated background — e.g. a slow CSS gradient sweep simulating aurora movement (opacity 0.05–0.1 so it doesn't compete with the text)

---

### SECTION 11 — Footer ✅ Keep, Minor Update

**Current State:** 4-column footer — AuroraLens brand + tagline, Observatory links, Company links, Updates email signup.

**What to Keep:** Everything.

**Minor addition:**  
Add a line of social proof at the very bottom, above the copyright: `"Joined by 12,000+ aurora observers across 47 countries."` — This leaves the visitor with a community feel even at the very end.

Update copyright year if needed: `© 2026 AuroraLens.`

---

## 4. Final Section Order Summary

```
01  Hero                    [keep — minor edits]
02  Trust Bar               [NEW]
03  How It Works            [moved up from position 3]
04  Live Activity Nodes     [moved down from position 2]
05  Engineering Features    [keep — minor enhancements]
06  Testimonials            [NEW]
07  Aura AI Assistant       [keep — minor enhancements]
08  Pricing / Plans         [NEW]
09  FAQ Accordion           [NEW]
10  Urgency CTA             [keep as-is]
11  Footer                  [keep — minor addition]
```

---

## 5. Global Design Consistency Rules

The following rules apply to all new sections and must be consistent with the existing design:

**Color Palette:**
- Background: `#0A0E1A` (primary dark)
- Card background: `#111827` or `#0F1623`
- Accent / Primary: `#00F5C4` (teal/cyan — used for highlights, active states, CTAs)
- Text primary: `#FFFFFF`
- Text secondary: `#9CA3AF` (muted gray)
- Text muted: `#4B5563`
- Success/Active: `#10B981` (green — used in status badges like "STABLE")
- Warning/Storm: `#F59E0B` (amber — used in "STORM" badges)
- Border: `rgba(255, 255, 255, 0.08)`

**Typography:**
- Headings: Bold weight, uppercase tracking for eyebrow labels
- Body: Regular weight, 16px base, 1.6 line-height
- The existing font stack should be preserved

**Cards:**
- `border-radius: 12px` or `16px`
- `border: 1px solid rgba(255, 255, 255, 0.08)`
- `background: rgba(255, 255, 255, 0.03)` to `rgba(255, 255, 255, 0.06)`
- No hard box shadows — the dark background handles depth via transparency

**Buttons:**
- Primary: `background: #00F5C4; color: #000; border-radius: 9999px; font-weight: 600`
- Secondary/Ghost: `background: transparent; border: 1px solid rgba(255,255,255,0.3); color: #fff`

**Section Spacing:**
- `padding: 80px 0` on desktop
- `padding: 60px 0` on mobile
- Max content width: `1280px` centered with auto margins

**Motion:**
- Prefer `IntersectionObserver` triggered fade-in + slide-up for sections entering viewport
- CSS keyframe animations: keep under 2s loop time, use `ease-in-out`
- Always wrap animations in `@media (prefers-reduced-motion: no-preference)` — respect accessibility

---

## 6. Implementation Priority Order

Implement in this order to get the highest-impact changes live first:

| Priority | Task | Effort | Impact |
|----------|------|--------|--------|
| P0 | Swap sections 02 and 03 (Live Nodes ↔ How It Works) | Low | High |
| P0 | Fix mobile hero spacing gap | Low | High |
| P1 | Build Trust Bar (Section 02) | Medium | High |
| P1 | Improve chat mockup contrast in Aura section | Low | Medium |
| P2 | Build Testimonials section (Section 06) | Medium | High |
| P2 | Build Pricing section (Section 08) | Medium | High |
| P3 | Build FAQ Accordion (Section 09) | Medium | Medium |
| P3 | Add KP-index tooltip to Live Nodes | Low | Medium |
| P4 | Replace hero planet orbs with functional visual | High | Medium |
| P4 | Add section-level scroll animations | Medium | Low |
| P5 | Animated satellite in 24/7 card | Medium | Low |

---

## 7. Notes for the AI Developer

- **Do not change copy in sections marked "keep."** Only layout, spacing, and interaction changes are authorized for existing sections. The copywriter has approved that language.
- **New sections use placeholder content.** Testimonials, pricing tiers, and FAQ answers are suggested drafts. Mark with `<!-- TODO: Replace with real content -->` comments and ship the structural layout.
- **Maintain the existing tech stack.** Do not introduce new major dependencies unless necessary. If the project uses Next.js/React, build new sections as React components. If it's plain HTML, build as HTML partials.
- **The "Aura" AI product name is distinct from "AuroraLens."** AuroraLens is the platform. Aura is the AI assistant within it. Do not conflate them in copy.
- **The existing mobile version (PDF) shows a Next.js app router setup** (the "N" badge visible in screenshots is the Next.js development indicator). Match component structure accordingly.
- **KP-index values shown in the Live Nodes section are live data.** Do not hardcode them — they should come from the existing data fetching layer. Only the card layout and UI is being adjusted, not the data source.

---

*End of brief. All questions about implementation details should reference the original codebase context. This document covers the "what" and "why" — the developer (you) owns the "how."*
