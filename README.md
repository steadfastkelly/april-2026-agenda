# Team Week Agenda - April 2026

A React + TypeScript application displaying a 4-day team schedule for April 20-23, 2026.

## Features

- **4-Day Schedule Display**: Monday through Thursday agenda
- **Department Filtering**: Filter events by Design, Account Management, or Development departments
- **Drag & Drop**: Rearrange events with drag-and-drop functionality
- **Responsive Design**: Optimized layouts for desktop, tablet, and mobile
- **Color-Coded Events**: Distinct colors for meals, meetings, production, breaks, etc.
- **Event Details**: Hover/click events to see full details including attendees and locations
- **Avatar System**: Department-colored initials for team members

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Vite** - Build tool
- **Motion (Framer Motion)** - Animations
- **react-dnd** - Drag and drop
- **pnpm** - Package manager

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Extract the archive:
   ```bash
   tar -xzf april-2026-agenda.tar.gz
   cd april-2026-agenda
   ```

2. Install dependencies:
   ```bash
   pnpm install
   # or
   npm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

## Building for Production

```bash
pnpm build
# or
npm run build
```

The production build will be in the `dist/` directory.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Vercel will auto-detect the Vite configuration
4. Deploy!

### Netlify

1. Build the project: `pnpm build`
2. Deploy the `dist/` folder
3. Configure build settings:
   - Build command: `pnpm build`
   - Publish directory: `dist`

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── App.tsx                 # Main application component
│   │   └── components/
│   │       ├── schedule-data.ts    # Event data (all 21 events)
│   │       ├── schedule-grid.tsx   # Desktop schedule grid
│   │       ├── mobile-schedule.tsx # Mobile swipe view
│   │       ├── filter-bar.tsx      # Department filter controls
│   │       ├── event-card.tsx      # Individual event cards
│   │       ├── avatar.tsx          # Unified avatar component
│   │       └── ...
│   ├── styles/
│   │   ├── index.css               # Global styles
│   │   ├── fonts.css               # Font imports
│   │   └── theme.css               # Tailwind theme tokens
│   └── main.tsx                    # App entry point
├── public/                         # Static assets
├── package.json                    # Dependencies
├── vite.config.ts                  # Vite configuration
└── tsconfig.json                   # TypeScript configuration
```

## Customization

### Adding Events

Edit `src/app/components/schedule-data.ts`:

```typescript
{
  id: "unique-id",
  day: 0,              // 0=Monday, 1=Tuesday, 2=Wednesday, 3=Thursday
  startHour: 9,        // 24-hour decimal (9.5 = 9:30 AM)
  endHour: 10,
  category: "MEETING", // MEAL, PRODUCTION, MEETING, TEAM BUILDING, BREAK, DRINKS, END
  badge: "DES",        // DES, AM, DEV, logo, or null
  title: "Event Title",
  titleDark: "Dark text portion",
  titleLight: "Light text portion (optional)",
}
```

### Changing Colors

Edit category colors in `src/app/components/schedule-data.ts`:

```typescript
export const CATEGORY_COLOR: Record<EventCategory, EventColor> = {
  MEAL:           "teal",
  PRODUCTION:     "purple",
  MEETING:        "gold",
  "TEAM BUILDING":"green",
  BREAK:          "slate",
  // ...
};
```

### Department Colors

Edit department colors in `src/app/components/people-data.ts`:

```typescript
export const DEPARTMENT_COLORS: Record<Department, string> = {
  Design: "#8d7ea6",
  "Account Management": "#c2ab74",
  Development: "#5e88a3",
};
```

## Data Storage

This app uses **local state only** - all event data is stored in code. Changes made via drag-and-drop or editing will persist during the session but reset on page reload.

For persistent storage, you could integrate:
- LocalStorage
- A backend API (Express, Supabase, Firebase)
- A CMS (Contentful, Sanity)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

© 2026 Steadfast. All rights reserved.

## Credits

Built with Claude Code by Anthropic.
