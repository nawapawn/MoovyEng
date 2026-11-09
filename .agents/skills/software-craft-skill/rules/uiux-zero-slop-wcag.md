# UI/UX & Accessibility Guidelines (Outcome-Oriented)

## 1. Objective
Guide front-end development toward readable, accessible (WCAG 2.2 AA), and visually deliberate interfaces.
Prioritize measurable user experience outcomes over rigid aesthetic dogma, and adapt to the project's existing design system.

---

## 2. Measurable Usability & Accessibility (WCAG 2.2 AA)

Focus on objective usability criteria:

### 2.1 Keyboard Navigation & Focus Visibility (Criteria 2.4.7)
* **Never suppress focus outlines blindly:** Removing `outline: none` or `outline-0` without an interactive replacement makes navigation impossible for keyboard and switch users.
* **Visible Focus Indicator:** Provide clear focus rings (e.g., `focus-visible:ring-2 focus-visible:ring-offset-2`).

### 2.2 Accessible Controls & Labeling (Criteria 4.1.2)
* **Icon-Only Buttons & Controls:** If an interactive element contains only an icon or emoji (e.g., `<button>🔍</button>`), it MUST have an accessible label via `aria-label="Search"`, `title="Search"`, or visually hidden text.
* **Form Inputs:** Ensure `<input>` elements are associated with a `<label>` or have `aria-label` / `aria-labelledby`.
* **Images:** Provide descriptive `alt` attributes on `<img>` elements (or `alt=""` if purely decorative).

### 2.3 Touch Targets & Sizing (Criteria 2.5.8)
* Ensure primary interactive elements (buttons, links, form inputs) on touch interfaces have adequate target size (recommended minimum $44 \times 44\text{px}$ bounding box or padding).

### 2.4 Contrast Ratios (Criteria 1.4.3)
* Normal text ($< 18\text{pt}$ / $24\text{px}$): Contrast ratio must be at least **4.5:1** against the background.
* Large text ($\ge 18\text{pt}$ or bold $\ge 14\text{pt}$): Contrast ratio must be at least **3.0:1**.

---

## 3. Design System & Styling Hygiene (Advisory)

Align with the project's existing styling approach:
1. **Respect Project Conventions:**
   - If the project uses Tailwind CSS, prefer semantic theme tokens over arbitrary hardcoded values (`p-[17px]`).
   - If the project uses CSS Modules, Styled Components, Chakra UI, Mantine, or vanilla CSS, follow that project's established conventions. Do not force Tailwind.
2. **Context-Aware Visual Consistency:**
   - Avoid generic, unbranded AI templates (e.g. gratuitous purple gradients) when the project already has an established corporate or brand palette.
   - Design interactive states where appropriate: default, hover, focus-visible, disabled, and loading states for async actions.
