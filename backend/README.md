# Wedding Album Backend

This is a minimal Node.js backend for uploading photos and storing "moments" metadata.

Features:
- `POST /api/moments` - upload an image (multipart form) and metadata (title, description, category)
- `GET /api/moments` - list stored moments
- `GET /api/moments/:id` - get a single moment
- Uploaded images are stored in `uploads/` and served at `/uploads/<filename>`
- Metadata is stored in `data/moments.json` (simple JSON file)

Quick start (from `backend/` directory):

```bash
npm install
npm run dev    # requires nodemon (dev)
# or
npm start
```

Example curl to upload an image and moment data:

```bash
curl -X POST http://localhost:4000/api/moments \
  -H "x-admin-password: YOUR_ADMIN_PASSWORD" \
  -F "image=@/full/path/to/photo.jpg" \
  -F "title=Save the Date" \
  -F "description=Sunny day at the lake" \
  -F "category=saveTheDate"
```

List moments:

```bash
curl http://localhost:4000/api/moments
```

Notes:
- This is a minimal implementation intended for local development or private deployments. For production use you should add authentication, input validation, and a proper database/storage (S3, cloud storage, SQL/NoSQL DB).
