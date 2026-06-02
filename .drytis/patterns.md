# Patterns

## Component Pattern
- Each section is a standalone component
- Sections use SectionWrapper for consistent padding/animation
- UI components are reusable (GlassCard, Button, Accordion)

## Naming Conventions
- Components: PascalCase (Hero.tsx, Pricing.tsx)
- CSS classes: Tailwind utility classes
- Constants: UPPER_SNAKE_CASE for data arrays
- Types: PascalCase interfaces

## Animation Pattern
- Use Framer Motion `motion.div` with `whileInView`
- Viewport trigger: `{ once: true, amount: 0.2 }`
- Stagger children using `variants` + `staggerChildren`
- Hover effects via `whileHover` / `whileTap`

## Theme Pattern
- Tailwind `dark:` prefix for dark mode styles
- CSS variables for theme colors
- ThemeProvider wraps app, reads localStorage + system preference

## Error Handling
- API routes return proper status codes
- Form validation client-side before submission
- Graceful fallbacks for missing data

## Testing
- Unit tests for utility functions
- Component tests for interactive elements (calculator, accordion, chat)
- Browser tests via Playwright for visual sections