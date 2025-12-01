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

Environment configuration
-------------------------
This project uses environment variables for both frontend and backend settings.

- Frontend: create a `.env.local` file at the repository root. Use `.env.example` as a template. The important variable is:
	- `NEXT_PUBLIC_API_BASE` — base URL of the backend (e.g. `http://localhost:4000`). This is exposed to the browser.

- Backend: create a `.env` (or use a process manager) in the `backend/` folder. Use `backend/.env.example` as a template. Important variables:
	- `PORT` — port backend listens on (default `4000`).
	- `ADMIN_PASSWORD` — admin password used by the admin endpoints.
	- `CORS_ORIGIN` — optional, restrict allowed origins for CORS (default `*`).

Examples:

Frontend (root `.env.local`):
```
NEXT_PUBLIC_API_BASE=http://localhost:4000
```

Backend (`backend/.env`):
```
PORT=4000
ADMIN_PASSWORD=your_admin_password_here
CORS_ORIGIN=http://localhost:3000
```

Notes:
- Images are using placeholder URLs from `picsum.photos`. To use local images, add them under `/public/images/<album>/` and update `data/albums.ts` to point to `/images/...` paths.
- Tailwind and PostCSS are already configured.

Enjoy!
