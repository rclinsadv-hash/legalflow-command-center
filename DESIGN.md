# LexOS — LegalFlow Command Center Design System

> **Brand**: LexOS · **Category**: Legal SaaS · **Aesthetic**: Premium Dark / Tech Utility  
> **Language**: Brazilian Portuguese · **Domain**: Law Firm Management

---

## 1. Visual Theme & Atmosphere

LexOS is a dark-mode-native, premium legal command center. The atmosphere is authoritative and high-trust — deep indigo-navy backgrounds communicate professionalism and focus, while violet-to-lilac accent gradients bring modern SaaS energy without sacrificing gravitas.

**Core principles:**
- Darkness as whitespace — near-black canvas with layered glass surfaces
- Violet authority — the accent hue signals intelligence and precision
- Gold for urgency — amber/gold marks deadlines and financial figures
- Zero visual clutter — forms, tables, and navigation stay tight and scannable

The product exists at the intersection of a legal OS and a command center: dense with data, yet never overwhelming.

---

## 2. Color Palette & Roles

### Background Surfaces (dark-to-light)
| Token | Hex | Role |
|-------|-----|------|
| `--bg` | `#06060f` | App canvas / body background |
| `--surface` | `#0d0d1e` | Sidebar, primary panels |
| `--surface2` | `#12122a` | Cards on surface, nested sections |
| `--glass` | `rgba(255,255,255,0.03)` | Glassmorphism card fill |
| `--glass-border` | `rgba(255,255,255,0.08)` | Subtle card/input borders |

### Accent — Violet Scale
| Token | Hex | Role |
|-------|-----|------|
| `--accent` | `#7c3aed` | Primary CTA, buttons, active nav pill |
| `--accent2` | `#a855f7` | Active nav text, focused inputs, logo gradient mid |
| `--accent3` | `#c084fc` | Logo gradient end, hover highlights |
| `--border` | `rgba(139,92,246,0.15)` | Panel borders, sidebar rule |
| `--border-bright` | `rgba(139,92,246,0.40)` | Focused state borders |

### Semantic / Status
| Token | Hex | Role |
|-------|-----|------|
| `--gold` | `#f59e0b` | Deadlines (prazos), financial, warnings |
| `--green` | `#10b981` | Success, active status, positive values |
| `--red` | `#ef4444` | Errors, deletions, overdue deadlines |
| `--blue` | `#3b82f6` | Informational, secondary actions |

### Text Hierarchy
| Token | Hex | Role |
|-------|-----|------|
| `--text` | `#e8e8f0` | Primary content |
| `--text2` | `#9090b0` | Secondary labels, nav items |
| `--text3` | `#5a5a7a` | Tertiary, disabled, table headers |

### Logo Gradient
```css
background: linear-gradient(135deg, #a855f7, #c084fc, #f59e0b);
```
Used exclusively on the wordmark "LexOS". Never apply to buttons or body text.

---

## 3. Typography Rules

### Font Stack
| Role | Family | Weight | Notes |
|------|--------|--------|-------|
| Body / UI | `DM Sans`, `Outfit`, sans-serif | 400, 500, 600, 700 | All body copy, nav, labels, tables |
| Wordmark | `DM Serif Display`, serif | 400 | Logo only — never for UI text |
| Fallback | System sans | — | `system-ui, -apple-system` |
| Icons | Font Awesome 6.4 | — | Via CDN; use `fas fa-*` solid set |

### Type Scale
| Usage | Size | Weight | Notes |
|-------|------|--------|-------|
| Logo / wordmark | 26px | 400 (serif) | Gradient fill |
| H1 / page title | 24px (`1.5rem`) | 600 | Top bar header |
| H3 / panel title | ~18px | 600 | Inside `.panel` |
| H4 / card title | ~15px | 600 | System cards |
| Body default | 14px (`0.9rem`) | 400 | Nav, paragraphs |
| Nav items | 13.5px | 400/500 | Active state = 500 |
| Labels | 11–12px | 600–700 | Uppercase, 1.5px tracking |
| Table headers | 10px | 700 | ALL CAPS, 1.5px letter-spacing |
| Logo sub | 10px | 400 | Uppercase, 2px tracking |

### Rules
- **Do not use** DM Serif Display outside the wordmark
- **Labels are always uppercase** with `letter-spacing: 1.5–2px`
- Table headers use `color: var(--text3)` — intentionally muted
- Line heights for body: 1.5; for headings: 1.2

---

## 4. Component Styling

### Buttons — `.btn-lex`
```css
background: var(--accent); /* #7c3aed */
color: #fff;
border: none;
padding: 12px 24px;
border-radius: 12px;
font-weight: 700;
cursor: pointer;
display: flex; align-items: center; gap: 8px;
transition: 0.3s;
```
Hover: `transform: translateY(-2px); box-shadow: 0 10px 20px rgba(139,92,246,0.2)`

### Quick Sync Button — `.btn-sync-quick`
Identical to `.btn-lex` but accepts `padding: 0.6rem 1.2rem; border-radius: 8px` for the top bar context.

### Panels — `.panel`
```css
background: var(--glass);         /* rgba(255,255,255,0.03) */
border: 1px solid var(--glass-border);
border-radius: 24px;
padding: 30px;
margin-bottom: 30px;
```

### Stat Cards — `.stat-card`
```css
padding: 2rem;
border-radius: 20px;
background: var(--glass);
border: 1px solid var(--glass-border);
display: flex; align-items: center; gap: 1.5rem;
```
- Icon: 2rem, `color: var(--accent)` (violet)
- Value: `font-size: 1.8rem; font-weight: 700`
- Label: `font-size: 0.9rem; color: var(--text-dim)`

### Navigation Items — `.nav-btn`
```css
padding: 10px 16px;
border-radius: 8px;
color: var(--text2);
font-size: 13.5px;
transition: all 0.15s;
```
Hover: `background: rgba(124,58,237,0.12); color: var(--text)`

Active:
```css
background: rgba(124,58,237,0.20);
color: #c084fc;
font-weight: 500;
/* left accent bar via ::before */
left: -8px; width: 3px; height: 20px;
background: var(--accent2);
```

### Sidebar
```css
width: 260px;
background: var(--surface);   /* #0d0d1e */
border-right: 1px solid var(--border);
position: fixed;
```

### Top Bar
```css
height: 60px;
background: rgba(6,6,15,0.85);
backdrop-filter: blur(20px);
border-bottom: 1px solid var(--border);
padding: 0 32px;
position: sticky; top: 0; z-index: 50;
```

### Form Inputs
```css
background: rgba(0,0,0,0.2);
border: 1px solid var(--glass-border);
border-radius: 12px;
padding: 15px;
color: #fff;
width: 100%;
```
Focus: `border-color: var(--accent2); box-shadow: 0 0 10px var(--border)`

### Tables
```
th: font-size: 10px; uppercase; letter-spacing: 1.5px; color: var(--text3); padding: 12px 14px; border-bottom: 1px solid var(--border)
td: padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.02)
```

### Badges / Status Pills
Small inline labels using semantic colors. Animated with `@keyframes pulse` (opacity 1→0.6→1 over 2s) for live/active states.

### Avatar
```css
width: 40px; height: 40px;
background: var(--accent);
border-radius: 10px;
```

### System Cards — `.system-card`
```css
padding: 1.5rem;
border-radius: 16px;
background: var(--glass);
border: 1px solid var(--glass-border);
text-align: center;
transition: transform 0.3s ease;
```
Hover: `transform: translateY(-5px); border-color: var(--accent)`

---

## 5. Layout Principles

### Structure
```
App = Fixed Sidebar (260px) + Scrollable Main (flex: 1, margin-left: 260px)
```

### Spacing Scale
| Step | Value | Used For |
|------|-------|---------|
| 4px | 4px | Gaps within logo stack |
| 8px | 8px | Nav item margins, small gaps |
| 12px | 12px | Input/button padding (compact) |
| 16px | 16px | Nav padding, icon gaps |
| 20px | 20px | Form grid gap, panel margin |
| 24px | 24px | Panel padding, button padding |
| 28px | 28px | Logo top padding, top bar margin-bottom |
| 30px | 30px | Panel padding, main content margin |
| 32px | 32px | Top bar horizontal padding |

### Border Radius Scale
| Token | Value | Component |
|-------|-------|-----------|
| Micro | 4px | — |
| Small | 6px | Example chips |
| Default | 8px | Nav items, sync button |
| Medium | 10px | Avatar |
| Large | 12px | Primary buttons, form inputs |
| XL | 16px | System cards |
| 2XL | 20px | Stat cards |
| 3XL | 24px | Main panels |

### Grid
- Stats grid: `repeat(3, 1fr)` at full width → `1fr` (stacked) below 1024px
- System grid: `1fr 1fr` two-column
- Form grid: `1fr 1fr` two-column

### Max Width
No explicit max-width — the sidebar constrains effective content width to `viewport - 260px`. Main content padding is `2rem` on all sides.

---

## 6. Depth & Elevation

LexOS uses layered transparency rather than box-shadows for depth:

| Layer | Background | Border | Usage |
|-------|------------|--------|-------|
| 0 — Canvas | `#06060f` (solid) | none | App background |
| 1 — Surface | `#0d0d1e` (solid) | `border-right: 1px solid var(--border)` | Sidebar |
| 2 — Surface 2 | `#12122a` (solid) | `1px solid rgba(139,92,246,0.15)` | Nested cards |
| 3 — Glass | `rgba(255,255,255,0.03)` | `1px solid rgba(255,255,255,0.08)` | Panels, stat cards |
| 4 — Overlay | `rgba(6,6,15,0.85)` + `blur(20px)` | `1px solid var(--border)` | Sticky top bar |
| 5 — Accent Glow | — | `box-shadow: 0 10px 20px rgba(139,92,246,0.2)` | Button hover |

**Rule**: Never use white or light drop shadows. All elevation uses semi-transparent violet borders and background opacity stepping.

---

## 7. Motion

### Page Transitions — `fadeIn`
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
duration: 0.4s; easing: ease;
```
Applied to `.view.active` on navigation switches.

### Button Hover
```css
transition: 0.3s; transform: translateY(-2px);
```

### Nav Item Hover
```css
transition: all 0.15s;
```

### System Card Hover
```css
transition: transform 0.3s ease; transform: translateY(-5px);
```

### Badge Pulse
```css
@keyframes pulse {
  0%   { opacity: 1; }
  50%  { opacity: 0.6; }
  100% { opacity: 1; }
}
animation: pulse 2s infinite;
```

### Principles
- All transitions are short (0.15–0.4s) — this is a work tool, not a marketing site
- Use `ease` for entrances, `linear` for pulses
- Avoid scale transforms on interactive elements (translate only)
- Never animate layout properties (width, height, padding)

---

## 8. Voice & Brand

### Brand Name
**LexOS** — the operating system for legal work. Sub-label: **COMMAND CENTER** in uppercase with wide letter-spacing.

### Tone
- **Portuguese (pt-BR)** — all UI strings, labels, and placeholder text
- Professional but approachable — "Dr. Raphael" not "User #1234"
- Imperative action labels: "Cadastrar Cliente", "Buscar", "Salvar e Ativar"
- Never passive: avoid "The data was saved" → use "Salvo!"

### Terminology (pt-BR legal domain)
| Label | Meaning |
|-------|---------|
| Intimações | Court notifications |
| Prazos | Legal deadlines |
| Processos | Legal cases / proceedings |
| Clientes | Clients (CRM) |
| Andamentos | Case updates/movements |
| Audiências | Hearings |
| Datajud | Brazil's CNJ national court database |
| Tribunal | Court |

### Logo Usage
- Wordmark "LexOS" uses DM Serif Display with the tri-color gradient (`#a855f7 → #c084fc → #f59e0b`)
- Sub-label uses `var(--text3)`, 10px, uppercase, 2px letter-spacing
- Never use the gradient on anything other than the wordmark

---

## 9. Do's, Don'ts & Anti-Patterns

### Do's
- ✓ Use `var(--accent)` (`#7c3aed`) as the single primary action color
- ✓ Apply the violet glow shadow on primary button hover only
- ✓ Use glass layers (`rgba(255,255,255,0.03)`) for cards on dark surfaces
- ✓ Keep form labels uppercase with 1.5–2px letter-spacing
- ✓ Use `--gold` (`#f59e0b`) for all deadline-related values to signal urgency
- ✓ Use `--green` for positive status, `--red` for errors/overdue
- ✓ Keep border-radius consistent: 24px for panels, 12px for inputs/buttons, 8px for nav
- ✓ Animate views with `fadeIn` (translateY + opacity) on active state

### Don'ts
- ✗ Don't use white or light-colored box-shadows — violet semi-transparent only
- ✗ Don't apply the logo gradient to UI elements (buttons, headers, icons)
- ✗ Don't use DM Serif Display outside the wordmark
- ✗ Don't use bright white (`#ffffff`) for body text — use `var(--text)` (`#e8e8f0`)
- ✗ Don't add border-radius above 24px for content panels
- ✗ Don't use solid colored backgrounds for panels — always use the glass/transparent layer
- ✗ Don't omit the active indicator bar (`::before` pseudo-element) from nav items
- ✗ Don't mix English and Portuguese in the same UI string
- ✗ Don't use `alert()` in production — replace with toast/modal component

### Anti-Patterns to Avoid
- **Accent overload**: violet should appear in nav active states, buttons, and icons only — not as card backgrounds or section headers
- **Missing glass hierarchy**: panels on `--bg` must use the glass layer; panels on `--surface` must use `--surface2` or glass
- **Heavy shadows**: no `box-shadow` with dark opaque colors — elevation is expressed through border transparency
- **Untracked state**: always reflect system state in the stats grid (processos count, clientes count, etc.)

---

## Agent Prompt Guide

### Quick Token Reference
```
Background: #06060f
Surface:    #0d0d1e
Accent:     #7c3aed  (violet — primary)
Accent mid: #a855f7  (lilac — active/focus)
Accent light:#c084fc (soft lilac — gradient end)
Gold:       #f59e0b  (deadlines, money)
Text:       #e8e8f0
Text dim:   #9090b0
Font:       DM Sans (UI), DM Serif Display (logo only)
```

### Rendering New Components
1. Cards → `background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 20–24px`
2. Buttons → `background: #7c3aed; border-radius: 12px; font-weight: 700`
3. Inputs → `background: rgba(0,0,0,0.2); border-radius: 12px; border: 1px solid rgba(255,255,255,0.08)`
4. Alerts/badges → use semantic color vars (`--gold`, `--green`, `--red`) as text color with glass backgrounds
5. Tables → `10px uppercase headers in --text3`, `1px solid rgba(255,255,255,0.02)` row dividers

### Iteration Checklist
- [ ] Background is `#06060f` or glass layer?
- [ ] Accent violet used sparingly (CTAs + active nav only)?
- [ ] Gold used for deadlines/money values?
- [ ] All labels uppercase with letter-spacing?
- [ ] View transitions use `fadeIn` animation?
- [ ] Responsive breakpoint collapses sidebar at ≤1024px?
- [ ] UI strings in pt-BR?
