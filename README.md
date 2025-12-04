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

S3 Uploads (optional)
---------------------
If you want to store uploaded images in AWS S3 instead of the local `backend/uploads` folder, set the following environment variables in `backend/.env` (see `backend/.env.example`):

- `S3_BUCKET` — your S3 bucket name
- `AWS_REGION` — AWS region (e.g. `us-east-1`)
- `AWS_ACCESS_KEY_ID` — IAM access key with PutObject permissions for the bucket
- `AWS_SECRET_ACCESS_KEY` — IAM secret

When these variables are set the backend will:

- Expose `/api/admin/s3-presign` (admin-only) that returns a presigned PUT URL and the public S3 URL for a generated key.
- Accept direct S3 uploads from admin clients using the presigned URL (the client PUTs the file to S3), then the client should save the returned public URL into settings or use it where needed.
- Fall back to local uploads if S3 is not configured.

Security note: For production, prefer using temporary credentials, least-privilege IAM roles, or a signed, time-limited presign flow to avoid long-lived credentials on servers.

Enjoy!
