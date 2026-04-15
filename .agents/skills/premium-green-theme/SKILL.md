---
name: premium-green-theme
description: Standardized instructions for refactoring frontend components to match the premium, modern emerald green design system established in Home and Product pages. Focuses on high-contrast, rounded typography, and dynamic shadows.
---

# Premium Green E-commerce Theme Guidelines

This skill provides the design tokens, Tailwind utility classes, and layout patterns needed to refactor any page in this e-commerce project to match the "Premium Green" aesthetic established in the `Home` and `Product` pages.

## 1. Color Palette (Hardcoded Tokens)

**CRITICAL: Avoid using `bg-primary` or `text-primary`.** The tailwind variable system for `primary` is currently unreliable. Use these hardcoded hex values to ensure the elements are visible:

*   **Primary Brand / Accent:** `#155e3a` (Deep Emerald Green) - *Buttons, active text, badges.*
*   **Primary Hover:** `#0f4a2b` (Darker Emerald) - *Interactive states.*
*   **Dark Section Background:** `#0a2e1f` (Dark forest green) - *Replaces black/slate sections.*
*   **Text on Dark:** `emerald-400` or `white`. Use `emerald-400` for titles/labels that need to pop on the dark green background.
*   **Light Backgrounds:** `bg-gray-50/50` or `bg-slate-50`.

## 2. Typography & Text Styling

*   **Main Headings (H1/H2/H3):** `font-black text-slate-900 tracking-tighter leading-tight` (on dark: `text-white`).
*   **Eyebrow/Caps labels:** `font-black uppercase tracking-widest text-[10px]` (e.g., "SĂN NGAY KẺO LỠ").
*   **Prices:** `font-black text-3xl text-[#155e3a] tracking-tighter`.
*   **Highlights:** Wrap keywords in `<span className="text-[#155e3a] italic">...</span>`.

## 3. Standard Layout Patterns

### Sidebar Column (e.g., CategorySidebar)
*   **Container:** `lg:sticky lg:top-32 h-fit space-y-8` (Manage stickiness in the parent page).
*   **Inner Wrapper:** Use a `Card` with `rounded-[2.5rem]`.
*   **Scrollable Lists:** For long category lists, use a standard `div` with `max-h-[500px] overflow-y-auto` rather than complex scroll libraries to avoid layout conflicts.

### Breadcrumb / Sticky Header
*   **Container:** `bg-white border-b sticky top-0 z-40 shadow-sm`
*   **Text:** `text-sm font-bold text-slate-400` with active items in `font-black text-slate-900`.

### Form Inputs & Search
*   **Input:** `rounded-2xl h-12 bg-white border-gray-100 shadow-sm focus-visible:ring-[#155e3a]/20 font-bold pl-12` (for search with icon).

## 4. UI Components

### Premium Buttons
*   **The "Wow" Button:** `h-14 px-10 bg-[#155e3a] text-white rounded-2xl font-black shadow-2xl shadow-[#155e3a]/40 hover:scale-105 transition-all`. For a cinematic feel, always wrap in a `<motion.button>` with `whileTap={{ scale: 0.95 }}`.
*   **Ghost/Icon:** `w-12 h-12 rounded-2xl text-[#155e3a] bg-[#155e3a]/10 hover:bg-[#155e3a] hover:text-white transition-all` (Increased size for a more premium touch).

### Guarantee/Feature Boxes
*   **Wrapper:** `flex gap-4 group/item p-6 rounded-[2rem] bg-white border border-gray-100 shadow-xl shadow-gray-200/30 transition-all hover:border-[#155e3a]/20`.
*   **Icon Box:** `w-12 h-12 rounded-2xl bg-[#155e3a]/10 text-[#155e3a] flex items-center justify-center shrink-0 group-hover/item:bg-[#155e3a] group-hover/item:text-white transition-all shadow-inner`.

## 5. Premium Animations (Framer Motion)

To elevate the UI to a boutique level, use these standardized `framer-motion` patterns:

### Cinematic Page Load
Wrap the main content of any new page in a `motion.div`:
```jsx
<motion.div 
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} // Custom cubic-bezier for "luxe" feel
>
  {/* Content */}
</motion.div>
```

### Scroll Reveals
Use for sections further down the page:
```jsx
<motion.section 
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 0.8 }}
>
```

### Staggered List Entrance
Use when mapping items (e.g., Products, Reviews, Categories) to create a "wave" effect:
```jsx
// Parent container
<motion.div 
  variants={{
    animate: { transition: { staggerChildren: 0.1 } }
  }}
  initial="initial"
  animate="animate"
>
  {items.map(item => (
     <motion.div variants={{
       initial: { opacity: 0, scale: 0.95 },
       animate: { opacity: 1, scale: 1 }
     }}>
       {/* Item content */}
     </motion.div>
  ))}
</motion.div>
```

### Interaction Feedback
*   **Cards:** Use `whileHover={{ y: -10, shadow: "0 25px 50px -12px rgba(21, 94, 58, 0.15)" }}`.
*   **Icons:** Use `whileHover={{ rotate: 15, scale: 1.1 }}`.

## 6. Execution Checklist & Troubleshooting

When refactoring:
1.  **Stop using variable colors:** If you see `text-primary`, replace it with `text-[#155e3a]`. 
2.  **Check for "White-outs":** If the page goes blank, check that you haven't closed a `SelectContent` or `Badge` prematurely or left a dangling comma in a map.
3.  **Shadow Check:** Ensure all primary buttons have the colored shadow: `shadow-[#155e3a]/40`.
4.  **Radius Check:** Every button, input, and card should have a radius of at least `rounded-2xl`. Main sections should use `rounded-[3.5rem]` or `rounded-[4rem]`.
5.  **Icon Visibility:** In dark sections, icons must be `text-white` or `text-emerald-400`. Default dark icons are invisible on dark green.
6.  **Motion Import:** Always ensure `import { motion } from 'framer-motion';` is present when using animation patterns.
