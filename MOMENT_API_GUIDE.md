# Wedding Moments API Documentation

## Endpoint: Create Moment Group

### POST `/api/admin/uploads`

Creates a new moment group by uploading 1-4 images with associated metadata.

**Authentication:**
- Header: `x-admin-password: <password>`

**Request Body:**
```
FormData:
  - images: File[] (1-4 image files)
  - metadata: JSON string of metadata array
```

**Metadata Structure:**
```json
[
  {
    "title": "Couple Name",
    "description": "Brief description of the moment",
    "category": "moments",
    "section": "moments",
    "caption": "Image 1 of 4"
  },
  {
    "title": "Couple Name - 2",
    "description": "",
    "category": "moments",
    "section": "moments",
    "caption": "Image 2 of 4"
  },
  // ... up to 4 objects
]
```

**Response:**
```json
{
  "success": true,
  "message": "Images uploaded successfully",
  "data": [
    {
      "id": 1,
      "title": "Couple Name",
      "description": "Brief description...",
      "category": "moments",
      "section": "moments",
      "caption": "Image 1 of 4",
      "image": "/uploads/image1.jpg",
      "createdAt": "2024-12-03T10:30:00Z"
    },
    // ... remaining images
  ]
}
```

---

## Endpoint: Fetch Moments

### GET `/api/moments`

Retrieves all uploaded moments.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Laura & James",
    "description": "An intimate city ceremony...",
    "category": "moments",
    "section": "moments",
    "caption": "Image 1 of 4",
    "image": "/uploads/image1.jpg",
    "createdAt": "2024-12-03T10:30:00Z"
  },
  // ... more moments
]
```

---

## Frontend Data Transformation

The frontend groups moments as follows:

```javascript
// Raw moments data from API
[
  { id: 1, title: "Laura & James", section: "moments", image: "..." },
  { id: 2, title: "Laura & James - 2", section: "moments", image: "..." },
  { id: 3, title: "Laura & James - 3", section: "moments", image: "..." },
  { id: 4, title: "Laura & James - 4", section: "moments", image: "..." },
  { id: 5, title: "Maria & Josh", section: "moments", image: "..." },
  // ...
]

// Grouped into moment blocks (max 4 per group)
[
  {
    id: 0,
    title: "Laura & James",
    description: "An intimate city ceremony...",
    images: [image1, image2, image3, image4],
    section: "moments"
  },
  {
    id: 1,
    title: "Maria & Josh",
    description: "Romantic portraits...",
    images: [image5, ...],
    section: "moments"
  }
]
```

---

## Usage Example

### Frontend Upload

```typescript
const formData = new FormData()

// Add up to 4 images
selectedFiles.forEach(file => {
  formData.append('images', file)
})

// Add metadata
const metadata = [
  {
    title: "Laura & James",
    description: "Beautiful engagement moment",
    category: "moments",
    section: "moments",
    caption: "Image 1 of 4"
  },
  // ... more metadata
]
formData.append('metadata', JSON.stringify(metadata))

// Send request
const response = await fetch('/api/admin/uploads', {
  method: 'POST',
  headers: {
    'x-admin-password': adminPassword
  },
  body: formData
})
```

---

## Database Schema

### Moments Table

```sql
CREATE TABLE moments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  description TEXT,
  category TEXT,
  section TEXT,
  caption TEXT,
  image TEXT,
  createdAt TEXT
)
```

---

## Best Practices

1. **Image Organization**: Use consistent naming for grouped images (e.g., "Laura & James" for first, "Laura & James - 2" for additional)

2. **Section Naming**: Use lowercase with hyphens for sections:
   - `moments` - Main moments
   - `wedding` - Wedding day
   - `engagement` - Engagement session
   - `pre-wedding` - Pre-wedding shoot

3. **Image Format**: Optimize images before upload:
   - Format: JPG or WebP
   - Max width: 1200px
   - Quality: 85-90%
   - File size: < 500KB per image

4. **Descriptions**: Keep descriptions to 2-3 sentences for optimal display

5. **Captions**: Use captions for image context within groups

---

## Moment Display on Frontend

Moments appear in the following layout:

```
Block 1 (Index 0): Text left, Images right
Block 2 (Index 1): Images left, Text right
Block 3 (Index 2): Text left, Images right
... alternating pattern continues
```

Each block displays:
- Title (serif, large)
- Description (light serif)
- "View Gallery" button
- 2x2 image grid with 4 images
