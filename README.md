# Saye Collective - Discovery Engine Prototype 

This repository contains my submission for the **Saye Collective 48-Hour Rapid Prototype Challenge**. 

The goal of this MVP is to serve as a "Discovery Engine" where artists, curators, and institutions can seamlessly find each other and showcase their work. 

## The 3 Core Pillars

1. **Smart Profiles:** A smooth onboarding flow utilizing Supabase Auth and Zod validation where users can select their role (Artist, Curator, Institution) and build their identity.
2. **Triple-Filter Search:** A powerful, faceted search interface allowing users to dynamically filter the network by *Geography*, *Discipline*, and *Interest*.
3. **The Archive:** A minimalist, energetic Masonry grid layout for users to showcase mixed media (text snippets, images, and external links) without the clutter of complex threads.

## Tech Stack & Architecture

To achieve a production-ready, highly energetic, and secure prototype within 48 hours, I selected the following stack:

* **Frontend:** Next.js (App Router), React, Tailwind CSS
* **UI/Animations:** Framer Motion, Lucide React
* **Backend & Auth:** Supabase (with strict Row Level Security enabled)
* **Form Validation:** React Hook Form + Zod
* **Deployment:** Vercel

## AI Workflow
As requested in the brief, my AI tooling setup (Claude 4.6 Sonnet and 4.7 Opus, and Codex 5.3) and the key prompts used to build the core logic are documented in the `AI_WORKFLOW_LOG.md` file included in this repository.

## 💻 Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/saye-discovery-engine.git