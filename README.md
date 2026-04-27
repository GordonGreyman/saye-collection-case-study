# Saye Collective

A platform for artists, curators, and institutions to build a presence, archive their practice, and connect with peers across disciplines and geographies.

## What it is

Saye is a professional network built around the art world. Members create a profile representing their role — Artist, Curator, or Institution — and build an archive of their work: texts, images, and links. The discover feed lets you find and connect with others by discipline, location, and interest.

**Core features:**
- Role-based profiles (Artist / Curator / Institution) with banner and profile photo
- Archive — a personal repository of texts, images, and links with cover images
- Discover — filter members by geography, discipline, and interest
- Connections — request and manage peer connections
- Full auth via email or Google

## Live demo

**URL:** https://saye-pi.vercel.app

**Test account:**
| | |
|---|---|
| Email | `demo@saye.art` |
| Password | `saye2026` |

The account is pre-populated with archive entries and a complete profile. You can also create your own account and explore the platform freely.

## Stack

- **Framework:** Next.js 16 (App Router)
- **Database & Auth:** Supabase (Postgres + Row Level Security + Storage)
- **Deployment:** Vercel
- **Styling:** Inline design system (`features/handoff/ui.jsx`)
- **Animations:** Framer Motion
