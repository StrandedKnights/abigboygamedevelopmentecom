# Findings — A Big Boy's Game Homepage Audit

## Technical Learnings (2026-03-26)

### 1. Element Centering Reliability
**Issue**: Centering text perfectly inside a circular badge is often botched by browser-specific line-heights or custom font baselines (`table-cell` approach still had micro-offsets).
**Resolution**: The only 100% mathematically perfect centering technique that ignores font metrics is:
```css
position: absolute;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);
line-height: 1;
```

### 2. Aesthetic Colors
**Issue**: The `#d593ff` purple was too bright when applied across large text, borders, and buttons globally, leading to visual fatigue in the dark theme.
**Resolution**: Swapped globally to `#9b5fe0`. This deep, muted purple provides excellent contrast against the `#0e0e13` background without blinding the user, allowing neon accents (like the green Xbox hover) to pop more.

### 3. Font Stacking Constraints
**Issue**: Adding `Barlow Condensed` for headings required ensuring it was loaded at weights 700, 800, 900 in the Google Fonts import, and properly mapped in `tailwind.config.mjs`.

### 4. Coolify Deployment Architecture
**Issue**: Astro SSR + Express Backend requires serving two Node instances if deployed via a single Docker container.
**Resolution**: Building a multi-stage Dockerfile that runs both via a lightweight shell script `start.sh` so Coolify can host them as a single application, utilizing ports `3000` and `4321`.
