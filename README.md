# airyty — Frontend

Frontend of **airyty**, an Airbnb-inspired property rental platform. Built with Next.js 16, React 19, and Tailwind CSS 4.

## Tech Stack

| Purpose          | Library                          |
| ---------------- | -------------------------------- |
| Framework        | Next.js 16 (App Router)          |
| Language         | TypeScript 5                     |
| Styling          | Tailwind CSS 4 + tw-animate-css  |
| UI Primitives    | shadcn/ui + Radix UI 1.4.3       |
| Icons            | lucide-react                     |
| State management | Zustand 5 (persisted auth store) |
| Forms            | React Hook Form 7 + Zod 4        |
| Class merging    | clsx + tailwind-merge (`cn()`)   |
| Package manager  | **bun**                          |

## Getting Started

Install dependencies and start the dev server:

```bash
bun install
bun run dev
```

Open [https://airyty-frontend.vercel.app](https://airyty-frontend.vercel.app) in your browser.

> The backend API must be running on `https://airyty-frontend.vercel.app`. See `https://airyty-frontend.vercel.app`.

## Available Scripts

```bash
bun run dev       # development server with hot reload
bun run build     # production build
bun run start     # serve production build
bun run lint      # ESLint
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                        # Root layout — Header + Geist fonts
│   ├── globals.css                       # Tailwind v4 + custom animations
│   ├── auth/
│   │   ├── layout.tsx                    # Split layout: gradient panel + form
│   │   ├── login/page.tsx
│   │   └── register/page.tsx             # Supports avatar upload + role selection
│   ├── account/page.tsx                  # Profile, password, GUEST→HOST upgrade
│   ├── bookings/
│   │   └── my-bookings/page.tsx          # Guest booking history (pay, refund, cancel)
│   └── (main)/
│       ├── page.tsx                      # Home: listing grid, filters, pagination
│       ├── listings/[id]/page.tsx        # Listing detail + gallery + BookingWidget
│       └── host/
│           ├── listings/page.tsx         # Host listing management
│           ├── listings/new/page.tsx     # Create listing (multi-image upload)
│           ├── listings/[id]/edit/page.tsx
│           └── bookings/page.tsx         # Incoming bookings management
├── shared/
│   └── components/
│       ├── global/Header.tsx             # Sticky header with user dropdown
│       ├── ui/                           # shadcn components
│       ├── auth/                         # LoginForm, RegisterForm
│       └── listings/                     # ListingCard, ListingFilters, ImageGallery, BookingWidget
├── lib/
│   ├── utils.ts                          # cn() helper
│   ├── cookies.ts                        # Token cookie helpers
│   └── api/                              # Typed fetch wrappers per domain
│       ├── client.ts                     # Base client (get/post/patch/delete + ApiError)
│       ├── auth.api.ts
│       ├── listings.api.ts
│       ├── bookings.api.ts
│       ├── payments.api.ts
│       └── users.api.ts
├── store/
│   └── auth.store.ts                     # Zustand auth store with cookie sync
├── types/
│   ├── auth.types.ts
│   ├── listing.types.ts
│   └── booking.types.ts
└── proxy.ts                              # Middleware: route protection by role
```

## Route Protection

Handled by `src/proxy.ts` (Next.js middleware):

- `/account`, `/host/*`, `/bookings/*` — require authentication (JWT cookie)
- `/auth/login`, `/auth/register` — redirect to home if already authenticated

## Key Conventions

- **Forms:** floating label inputs (peer CSS), Zod schema + `zodResolver`, `noValidate`
- **Submit buttons:** `bg-gradient-to-r from-[#ff385c] to-[#e31c5f]`
- **Images:** `<Image>` for Cloudinary URLs, `<img>` for local blob previews
- **API calls:** client components with `useEffect`; always guard with `if (!token) return`
- **Colors:** oklch variables (Tailwind v4); brand color `#ff385c`
- **Animations:** `fadeInUp`, `fadeIn`, `slideInRight`, `scaleInImage`, `shimmer`, `pulseGlow`

## Adding shadcn Components

```bash
npx shadcn@latest add <component>
```

Components are aliased to `@/shared/components/ui`.

## Environment

No `.env` file needed for the frontend. The API base URL is hardcoded to `DOMAIN/api` in `src/lib/api/client.ts`.

Cloudinary images are served via `res.cloudinary.com` (allowed in `next.config.ts`).
