# Modern Next.js Boilerplate

A production-ready starter template built on **Next.js 16**, **React 19**, and **TypeScript**, configured with clean CSS Modules and zero unnecessary framework bloat.

---

## ⚡ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: Vanilla CSS & CSS Modules with CSS Variables
- **Linting**: [ESLint 9](https://eslint.org/)
- **Font**: Google Font [Geist](https://vercel.com/font)

---

## 🚀 Getting Started

### 1. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Available Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| **Development** | `npm run dev` | Launches dev server with Turbopack fast refresh |
| **Build** | `npm run build` | Compiles optimized production bundle |
| **Start** | `npm run start` | Runs the production build server |
| **Lint** | `npm run lint` | Runs ESLint check across all files |

---

## 📁 Project Structure

```
GPS/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── health/route.ts      # Health check REST API endpoint
│   │   ├── favicon.ico
│   │   ├── globals.css              # Global tokens & CSS variables
│   │   ├── layout.tsx               # Root HTML shell & Geist font setup
│   │   ├── page.module.css          # Scoped CSS for landing page
│   │   └── page.tsx                 # Main homepage (Server Component)
│   └── components/
│       ├── FeatureCard.tsx          # Reusable feature display component
│       ├── FeatureCard.module.css
│       ├── InteractiveShowcase.tsx  # Client component sandbox & API tester
│       └── InteractiveShowcase.module.css
├── public/                          # Static assets and icons
├── eslint.config.mjs                # ESLint configuration
├── next.config.ts                   # Next.js compiler settings
├── tsconfig.json                    # Strict TypeScript configuration
└── package.json                     # Project manifest and scripts
```

---

## 🔌 API Demonstration

A health check route handler is pre-configured at:
- **`GET /api/health`**: Returns JSON status, timestamp, framework version, and active features.

---

## 🚢 Deployment

The easiest way to deploy this Next.js app is through [Vercel](https://vercel.com):

1. Push your repository to GitHub / GitLab / Bitbucket.
2. Import the project in Vercel.
3. Deploy with zero configuration.
