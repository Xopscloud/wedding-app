# Next.js Photo Album

This is a minimal Next.js 14 (App Router) photo album built with TypeScript and Tailwind CSS.

Features:
- Landing page with album sections
- Moments page (highlights)
- Gallery page (all images)
- 5 album pages: Save the Date, Engagement, Wedding, Sweet Going, Pre-Wedding
- Reusable components: `ImageGrid`, `AlbumSectionCard`, `Navbar`, `Footer`, `HeroSection`
- Lightbox/modal preview and lazy loading

Quick start (Windows PowerShell):

```powershell
npm install
npm run dev
```

Open http://localhost:3000

Notes:
- Images are using placeholder URLs from `picsum.photos`. To use local images, add them under `/public/images/<album>/` and update `data/albums.ts` to point to `/images/...` paths.
- Tailwind and PostCSS are already configured.

Enjoy!
