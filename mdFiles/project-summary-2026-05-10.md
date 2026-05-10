# CrowdfundingIO — Project Summary
**Generated:** 2026-05-10

---

## What this project is

**crowdfund.mn** — A Mongolian crowdfunding platform (Kickstarter-style), built with:
- **Next.js** (App Router) + TypeScript + Tailwind CSS + Prisma ORM
- Mongolian language UI (mn-MN locale), Tugrik (₮) currency
- Payment integrations planned: QPay, SocialPay, Card

---

## Pages & Components Built

| Page / Component | Description |
|---|---|
| Landing — `Navbar` | Fixed top nav with auth links |
| Landing — `Categories` | Category browse section |
| Landing — `TrendingProjects` | Featured + trending project cards |
| Landing — `TrustSection` | Social proof / trust signals |
| `/explore` — `ExploreClient` | Browse & filter all projects |
| `/projects/[slug]` — `ProjectDetailClient` | Project detail with tabs: About, Updates, Rewards; sticky funding card sidebar |
| `/profile` — `ProfileClient` | User profile page |
| `/admin/dashboard` — `AdminDashboardClient` | Full admin panel (4 tabs: overview, queue, all projects, users) |
| `AdminBar` | Fixed top admin navigation bar with pending badge |
| `AdminShell` | Admin layout wrapper |
| `space-landing.html` | Standalone space-themed landing prototype (not integrated) |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| ORM | Prisma |
| Icons | Lucide React |
| Auth | Custom `AuthContext` |
| Toasts | Custom `ToastContext` |
| CI/CD | GitHub Actions (self-hosted runner, Node.js 24.14.1) |
| Process manager | pm2 |

---

## Admin Dashboard Features

- **Overview tab**: 4 stat cards (total projects, raised amount, users, pending), recent projects table with funding progress bars, activity feed (signups + new submissions), quick-action buttons
- **Queue tab**: Review PENDING projects — approve or reject with optional reason, debounced search, pagination (20/page)
- **All Projects tab**: Manage all statuses — inline edit modal (title, description, goal, end date, category, location, trending/featured/verified flags), soft delete, pagination
- **Users tab**: Search users, toggle admin role, toggle verified status, pagination (30/page)

---

## Known Issues

| # | Issue | Priority |
|---|---|---|
| 1 | `crowdfund-mn/` source directory is **empty** — files only exist in `.history/` VS Code snapshots | Critical |
| 2 | `TrendingProjects` and `ProjectDetailClient` use hardcoded `MOCK_PROJECTS` / `MOCK_REWARD_TIERS` | High |
| 3 | Donate/back CTA button in `ProjectDetailClient` has no label text (empty button) | High |
| 4 | No actual payment flow implemented (QPay, SocialPay, Card are placeholder badges only) | High |
| 5 | GitHub Actions: `pm2 restart 0` is commented out — deployments don't restart the server | Medium |
| 6 | `space-landing.html` is an orphaned file — not integrated or linked anywhere | Low |

---

## Suggestions (Priority Order)

1. **Restore source files** from `.history/` snapshots — take the latest timestamp variant of each file and write them back to `crowdfund-mn/src/`
2. **Wire TrendingProjects to the real API** — replace `MOCK_PROJECTS` with a fetch to `/api/projects`
3. **Fix donate button** — add the missing label (`Дэмжих`) to the CTA in `ProjectDetailClient`
4. **Implement payment flow** — build the donation flow with QPay / SocialPay integration
5. **Fix CI/CD** — uncomment `pm2 restart 0` (or use `pm2 reload`) in the GitHub Actions workflow
6. **Decide on `space-landing.html`** — integrate it as the new landing design or remove it

---

## File Locations (History Snapshots)

```
.history/crowdfund-mn/src/
├── app/
│   ├── admin/dashboard/AdminDashboardClient_*.tsx
│   ├── categories/page_*.tsx
│   ├── explore/ExploreClient_*.tsx
│   ├── explore/page_*.tsx
│   └── projects/[slug]/ProjectDetailClient_*.tsx
│   └── profile/ProfileClient_*.tsx
└── components/
    ├── admin/AdminBar_*.tsx
    ├── admin/AdminShell_*.tsx
    ├── landing/Categories_*.tsx
    ├── landing/Navbar_*.tsx
    ├── landing/TrendingProjects_*.tsx
    ├── landing/TrustSection_*.tsx
    └── projects/ProjectCard_*.tsx
```
