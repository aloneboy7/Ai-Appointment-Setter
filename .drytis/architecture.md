# Architecture

## Directory Structure
```
src/
├── app/
│   ├── layout.tsx          # Root layout: fonts, metadata, theme provider
│   ├── page.tsx            # Landing page (composes all sections)
│   ├── globals.css         # Tailwind + custom CSS
│   └── api/                # API routes
│       ├── contact/route.ts
│       └── subscribe/route.ts
├── components/
│   ├── layout/             # Navbar, Footer, FloatingCTA
│   ├── sections/           # All page sections
│   ├── ui/                 # Reusable UI components
│   └── shared/             # SectionWrapper, Button
└── lib/
    ├── constants.ts        # All data/copy
    └── utils.ts            # Helpers
```

## Data Flow
- Static site with client-side animations
- API routes handle form submissions (future: database persistence)
- Theme managed via React context + localStorage
- All section data defined in constants.ts

## Routing
- `/` — Landing page (all sections)
- `/api/contact` — POST contact form
- `/api/subscribe` — POST newsletter signup

## Performance
- Next.js static generation where possible
- Framer Motion lazy animations
- Image optimization via next/image
- Font optimization via next/font