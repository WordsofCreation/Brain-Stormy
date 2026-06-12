# Brain Stormy

Brain Stormy is a standalone brainstorming, idea organization, and calendar execution web app. It helps users capture ideas, organize brainstorms into clear structures, turn ideas into goals and projects, and schedule action steps on a calendar.

This repository contains the initial React + Vite foundation with TypeScript, Tailwind CSS, Framer Motion, GSAP ScrollTrigger preparation, responsive navigation, reusable UI components, and starter local-storage-backed sample data.

## Custom logo GIF

Place your logo GIF at `public/logo/brain-stormy-logo.gif`. Vite serves files from the `public` directory at the site root, and the app header is already configured to load the GIF from `/logo/brain-stormy-logo.gif`.

If that file is not present yet, the app keeps using the default brain icon fallback.

## Run locally

```bash
npm install
npm run dev
```

## Build for production

```bash
npm run build
npm run preview
```

## Deploy from GitHub

The `.github/workflows/deploy.yml` workflow builds the Vite app and deploys the `dist` directory to GitHub Pages when changes are pushed to `main` or when the workflow is manually triggered.

In the repository settings, enable GitHub Pages and select **GitHub Actions** as the source.
