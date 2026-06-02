This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Video Recorder — Local Development

Presently records websites as demo videos using Playwright + Xvfb + FFmpeg,
orchestrated via a BullMQ job queue backed by Redis.

### Prerequisites

Install these system packages before running the recorder:

```bash
# Arch Linux — Wayland-compatible (run via XWayland)
sudo pacman -S xorg-server-xvfb xorg-xdpyinfo ffmpeg redis

# Ubuntu / Debian
sudo apt install xvfb x11-utils ffmpeg redis-server
```

Google Chrome must also be installed. On Arch:

```bash
# via AUR
yay -S google-chrome
# Chrome will be at /usr/bin/google-chrome-stable
```

### Environment setup

```bash
cp .env.example .env.local
# Edit .env.local and confirm CHROME_EXECUTABLE, REDIS_URL, OUTPUT_DIR
```

### Start Redis

```bash
redis-server
```

### Run the development server

The worker starts automatically in-process when the Next.js dev server is running:

```bash
bun dev
```

Then open [http://localhost:3000/generate](http://localhost:3000/generate) to use the recorder UI.

### Run the worker as a standalone process (production)

```bash
bun run worker
```

### Arch Linux / Wayland note

Xvfb works via XWayland — no Wayland-native alternatives are required. The
entire `Xvfb + Chrome + FFmpeg x11grab` pipeline runs inside a virtual X11
display that is invisible to the host compositor.

Verify Xvfb is working after starting it on display `:99`:

```bash
xdpyinfo -display :99
```
