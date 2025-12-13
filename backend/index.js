require('dotenv').config()
const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { MongoClient, ObjectId } = require('mongodb')
const cors = require('cors')
// Try to load AWS SDK v3 (modular). Fall back to disabling S3 support if not installed.
let S3Client, PutObjectCommand, getSignedUrl
let s3Client = null
try {
  const s3pkg = require('@aws-sdk/client-s3')
  S3Client = s3pkg.S3Client
  PutObjectCommand = s3pkg.PutObjectCommand
  getSignedUrl = require('@aws-sdk/s3-request-presigner').getSignedUrl
} catch (err) {
  console.warn('@aws-sdk/* packages not found; S3 uploads will be disabled. Run `npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner` in backend to enable S3 support.')
}

const app = express()
const PORT = process.env.PORT || 4000
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin'


// MongoDB configuration
const DB_TYPE = process.env.DB_TYPE || 'mongodb'
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wedding-app'
const DB_NAME = process.env.DB_NAME || 'wedding-app'

console.log('Backend config:', { PORT, CORS_ORIGIN, ADMIN_PASSWORD_SET: !!process.env.ADMIN_PASSWORD, MONGODB_URI: MONGODB_URI.replace(/:[^:@]*@/, ':***@'), DB_NAME, DB_TYPE })

app.use(cors({ origin: CORS_ORIGIN }))
app.use(express.json())

let db, momentsCollection, settingsCollection

MongoClient.connect(MONGODB_URI)
  .then(client => {
    console.log('MongoDB connected')
    db = client.db(DB_NAME)
    momentsCollection = db.collection('moments')
    settingsCollection = db.collection('settings')
    
    // Create indexes
    momentsCollection.createIndex({ createdAt: -1 })
    settingsCollection.createIndex({ key: 1 }, { unique: true })
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err)
    process.exit(1)
  })

async function getSetting(key) {
  try {
    const doc = await settingsCollection.findOne({ key })
    return doc ? doc.value : null
  } catch (err) {
    throw err
  }
}

async function setSetting(key, value) {
  try {
    await settingsCollection.replaceOne(
      { key },
      { key, value },
      { upsert: true }
    )
    return true
  } catch (err) {
    throw err
  }
}

// Decide between local uploads or S3 based on environment
const S3_BUCKET = process.env.S3_BUCKET || ''
const AWS_REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || ''
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || ''
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || ''

let upload
let UPLOADS_DIR
let s3

// Set up uploads directory
UPLOADS_DIR = path.join(__dirname, 'uploads')
app.use('/uploads', express.static(UPLOADS_DIR))
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })

// Set up public images directory
const PUBLIC_IMAGES_DIR = path.join(__dirname, '../public/images')
app.use('/images', express.static(PUBLIC_IMAGES_DIR))

// Ensure all required directories exist
const requiredDirs = [
  path.join(PUBLIC_IMAGES_DIR, 'covers'),
  path.join(PUBLIC_IMAGES_DIR, 'highlights'),
  path.join(PUBLIC_IMAGES_DIR, 'landing')
]
requiredDirs.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
})

if (S3_BUCKET && AWS_REGION && AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && S3Client) {
  try {
    s3Client = new S3Client({ region: AWS_REGION, credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY } })
    console.log('S3 uploads enabled, bucket:', S3_BUCKET)
  } catch (err) {
    console.warn('S3 configuration failed:', err.message)
    s3Client = null
  }
} else {
  s3Client = null
  console.log('S3 disabled - missing configuration')
}

// Use memory storage for S3 uploads, disk storage for local fallback
const memoryStorage = multer.memoryStorage()
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR)
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname)
    const name = path.basename(file.originalname, ext)
    const safeName = name.replace(/[^a-z0-9_-]/gi, '_')
    cb(null, `${Date.now()}-${safeName}${ext}`)
  }
})

const uploadMemory = multer({ storage: memoryStorage, limits: { fileSize: 50 * 1024 * 1024 } })
upload = s3Client ? uploadMemory : multer({ storage: diskStorage, limits: { fileSize: 50 * 1024 * 1024 } })
console.log('Using local file storage')

// Helpers
async function readMoments() {
  try {
    const docs = await momentsCollection.find({}).sort({ createdAt: -1 }).toArray()
    return docs.map(doc => ({ ...doc, id: doc._id.toString() }))
  } catch (err) {
    throw err
  }
}

async function insertMoment(m) {
  try {
    const result = await momentsCollection.insertOne({
      title: m.title,
      description: m.description,
      category: m.category,
      section: m.section || '',
      caption: m.caption || '',
      image: m.image,
      createdAt: m.createdAt
    })
    return { id: result.insertedId.toString(), ...m }
  } catch (err) {
    throw err
  }
}

async function updateMoment(id, fields) {
  try {
    const updateFields = {}
    if (fields.title !== undefined) updateFields.title = fields.title
    if (fields.description !== undefined) updateFields.description = fields.description
    if (fields.category !== undefined) updateFields.category = fields.category
    if (fields.section !== undefined) updateFields.section = fields.section
    if (fields.caption !== undefined) updateFields.caption = fields.caption
    if (fields.image !== undefined) updateFields.image = fields.image
    
    if (Object.keys(updateFields).length === 0) return
    
    await momentsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    )
  } catch (err) {
    throw err
  }
}

async function deleteMomentById(id) {
  try {
    await momentsCollection.deleteOne({ _id: new ObjectId(id) })
  } catch (err) {
    throw err
  }
}

// Routes
app.get('/api/moments', async (req, res) => {
  try {
    const moments = await readMoments()
    res.json(moments)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to read moments' })
  }
})

// Admin-protected upload endpoint: requires ADMIN_PASSWORD in header 'x-admin-password'
app.post('/api/moments', upload.single('image'), async (req, res) => {
  try {
    const adminPass = req.headers['x-admin-password']
    if (adminPass !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { title, description, category } = req.body
    if (!req.file) return res.status(400).json({ error: 'Image file is required (field name: image)' })

    let imageUrl = ''
    if (s3Client && req.file && req.file.buffer) {
      const ext = path.extname(req.file.originalname)
      const name = path.basename(req.file.originalname, ext)
      const safeName = name.replace(/[^a-z0-9_-]/gi, '_')
      const key = `${Date.now()}-${safeName}${ext}`
      const params = {
        Bucket: S3_BUCKET,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
      }
      try{
        await s3Client.send(new PutObjectCommand(params))
        imageUrl = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`
      }catch(err){
        console.error('S3 upload failed, using local storage', err)
        const filename = `${Date.now()}-fallback${path.extname(req.file.originalname)}`
        const filepath = path.join(UPLOADS_DIR, filename)
        fs.writeFileSync(filepath, req.file.buffer)
        imageUrl = `/uploads/${filename}`
      }
    } else {
      const filename = req.file.filename || `${Date.now()}-upload${path.extname(req.file.originalname)}`
      imageUrl = `/uploads/${filename}`
    }

    const newMoment = {
      title: title || '',
      description: description || '',
      category: category || '',
      section: req.body.section || '',
      caption: req.body.caption || '',
      image: imageUrl,
      createdAt: new Date().toISOString()
    }

    const inserted = await insertMoment(newMoment)
    res.status(201).json(inserted)
  } catch (err) {
    console.error('Upload failed', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/api/moments/:id', async (req, res) => {
  try {
    const doc = await momentsCollection.findOne({ _id: new ObjectId(req.params.id) })
    if (!doc) return res.status(404).json({ error: 'Not found' })
    res.json({ ...doc, id: doc._id.toString() })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Admin endpoints: list and delete moments (protected)
app.get('/api/admin/moments', async (req, res) => {
  const adminPass = req.headers['x-admin-password']
  if (adminPass !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    const moments = await readMoments()
    res.json(moments)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.delete('/api/admin/moments/:id', async (req, res) => {
  const adminPass = req.headers['x-admin-password']
  if (adminPass !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    await deleteMomentById(req.params.id)
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Admin multi-upload endpoint
app.post('/api/admin/uploads', upload.array('images', 20), async (req, res) => {
  try {
    const adminPass = req.headers['x-admin-password']
    if (adminPass !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const metadataRaw = req.body.metadata || '[]'
    let metadata = []
    try { metadata = JSON.parse(metadataRaw) } catch (e) { metadata = [] }

    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'At least one image is required (field name: images)' })

    const insertedCount = req.files.length
    const now = new Date().toISOString()

    for (let idx = 0; idx < req.files.length; idx++){
      const file = req.files[idx]
      let imageUrl = ''
      if (s3Client && file && file.buffer) {
        const ext = path.extname(file.originalname)
        const name = path.basename(file.originalname, ext)
        const safeName = name.replace(/[^a-z0-9_-]/gi, '_')
        const key = `${Date.now()}-${idx}-${safeName}${ext}`
        const params = { Bucket: S3_BUCKET, Key: key, Body: file.buffer, ContentType: file.mimetype }
        try{
          await s3Client.send(new PutObjectCommand(params))
          imageUrl = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`
        }catch(err){
          console.error('S3 upload failed, using local storage', err)
          const filename = `${Date.now()}-${idx}-fallback${path.extname(file.originalname)}`
          const filepath = path.join(UPLOADS_DIR, filename)
          fs.writeFileSync(filepath, file.buffer)
          imageUrl = `/uploads/${filename}`
        }
      } else {
        const filename = file.filename || `${Date.now()}-${idx}-upload${path.extname(file.originalname)}`
        imageUrl = `/uploads/${filename}`
      }
      const meta = metadata[idx] || {}
      const newMoment = {
        title: meta.title || '',
        description: meta.description || '',
        category: meta.category || '',
        section: meta.section || req.body.section || '',
        caption: meta.caption || '',
        image: imageUrl,
        createdAt: now
      }
      try {
        await insertMoment(newMoment)
      } catch (err) {
        console.error('Insert failed', err)
      }
    }

    res.status(201).json({ insertedCount })
  } catch (err) {
    console.error('Upload failed', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Admin update endpoint
app.put('/api/admin/moments/:id', upload.single('image'), async (req, res) => {
  const adminPass = req.headers['x-admin-password']
  if (adminPass !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const id = req.params.id
  const fields = {
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    section: req.body.section,
    caption: req.body.caption
  }

  // Handle optional replacement image
  if (req.file && req.file.filename) {
    fields.image = `/uploads/${req.file.filename}`
  }

  try {
    await updateMoment(id, fields)
    const doc = await momentsCollection.findOne({ _id: new ObjectId(id) })
    res.json({ ...doc, id: doc._id.toString() })
  } catch (err) {
    console.error('Update failed', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Admin endpoint to upload landing page image
app.post('/api/admin/landing-image', uploadMemory.single('image'), async (req, res) => {
  const adminPass = req.headers['x-admin-password']
  if (adminPass !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  if (!req.file) return res.status(400).json({ error: 'Image file is required' })
  
  try {
    const landingDir = path.join(__dirname, '../public/images/landing')
    if (!fs.existsSync(landingDir)) fs.mkdirSync(landingDir, { recursive: true })
    
    const targetPath = path.join(landingDir, 'DSC03522.JPG')
    fs.writeFileSync(targetPath, req.file.buffer)
    
    res.status(201).json({ image: '/images/landing/DSC03522.JPG' })
  } catch (err) {
    console.error('Landing upload failed', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Public endpoint to get landing image
app.get('/api/settings/landing-image', async (req, res) => {
  res.json({ image: '/images/landing/DSC03522.JPG' })
})

// Admin endpoint to upload album cover image
app.post('/api/admin/album-cover', uploadMemory.single('image'), async (req, res) => {
  const adminPass = req.headers['x-admin-password']
  if (adminPass !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  const { albumKey } = req.body
  if (!req.file || !albumKey) {
    return res.status(400).json({ error: 'Image file and albumKey are required' })
  }
  
  const coverMap = {
    saveTheDate: 'save-the-date-cover.jpg',
    engagement: 'engagement-cover.jpg', 
    wedding: 'wedding-cover.jpg',
    madhuramveppu: 'madhuramveppu-cover.jpg',
    preWedding: 'pre-wedding-cover.jpg',
    promiseOfAThousandTomorrows: 'promise-cover.jpg'
  }
  
  const filename = coverMap[albumKey]
  if (!filename) {
    return res.status(400).json({ error: 'Invalid album key' })
  }
  
  try {
    const coversDir = path.join(__dirname, '../public/images/covers')
    if (!fs.existsSync(coversDir)) fs.mkdirSync(coversDir, { recursive: true })
    
    const targetPath = path.join(coversDir, filename)
    fs.writeFileSync(targetPath, req.file.buffer)
    
    res.status(201).json({ image: `/images/covers/${filename}` })
  } catch (err) {
    console.error('Cover upload failed', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Admin endpoint to upload moments/gallery button images
app.post('/api/admin/button-image', uploadMemory.single('image'), async (req, res) => {
  const adminPass = req.headers['x-admin-password']
  if (adminPass !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  const { buttonType } = req.body
  if (!req.file || !buttonType) {
    return res.status(400).json({ error: 'Image file and buttonType are required' })
  }
  
  const buttonMap = {
    moments: 'moments-cover.jpg',
    gallery: 'gallery-cover.jpg'
  }
  
  const filename = buttonMap[buttonType]
  if (!filename) {
    return res.status(400).json({ error: 'Invalid button type' })
  }
  
  try {
    const coversDir = path.join(__dirname, '../public/images/covers')
    if (!fs.existsSync(coversDir)) fs.mkdirSync(coversDir, { recursive: true })
    
    const targetPath = path.join(coversDir, filename)
    fs.writeFileSync(targetPath, req.file.buffer)
    
    res.status(201).json({ image: `/images/covers/${filename}` })
  } catch (err) {
    console.error('Button image upload failed', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Public: list all settings
app.get('/api/settings', async (req, res) => {
  try {
    const docs = await settingsCollection.find({}).toArray()
    const out = {}
    docs.forEach(doc => { out[doc.key] = doc.value })
    res.json(out)
  } catch (err) {
    console.error('Failed to list settings', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Public: get single setting by key
app.get('/api/settings/:key', async (req, res) => {
  try {
    const value = await getSetting(req.params.key)
    res.json({ value: value })
  } catch (err) {
    console.error('Failed to read setting', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Admin: set a setting key/value
app.post('/api/admin/settings', async (req, res) => {
  const adminPass = req.headers['x-admin-password']
  if (adminPass !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' })
  const { key, value } = req.body || {}
  if (!key) return res.status(400).json({ error: 'Missing key' })
  try {
    await setSetting(key, value || '')
    res.json({ success: true })
  } catch (err) {
    console.error('Failed to set setting', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Public: get album images (combines static and database images)
app.get('/api/albums/:albumKey', async (req, res) => {
  try {
    const albumKey = req.params.albumKey
    const staticAlbums = {
      saveTheDate: ["/images/save-the-date/1.jpg", "/images/save-the-date/2.jpg", "/images/save-the-date/3.jpg"],
      engagement: ["/images/engagement/1.jpg", "/images/engagement/2.jpg", "/images/engagement/3.jpg"],
      wedding: ["/images/wedding/1.jpg", "/images/wedding/2.jpg", "/images/wedding/3.jpg", "/images/wedding/4.jpg"],
      madhuramveppu: ["/images/madhuramveppu/1.jpg", "/images/madhuramveppu/2.jpg"],
      preWedding: ["/images/pre-wedding/1.jpg", "/images/pre-wedding/2.jpg"],
      promiseOfAThousandTomorrows: ["/images/promise/1.jpg", "/images/promise/2.jpg"]
    }
    
    // Get static images
    const staticImages = staticAlbums[albumKey] || []
    
    // Get database images for this album
    const dbMoments = await momentsCollection.find({ section: albumKey }).sort({ createdAt: -1 }).toArray()
    const dbImages = dbMoments.map(m => m.image)
    
    // Combine static and database images
    const allImages = [...staticImages, ...dbImages]
    
    res.json({ images: allImages })
  } catch (err) {
    console.error('Failed to get album images', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Admin: generate a presigned PUT URL for direct S3 uploads
app.post('/api/admin/s3-presign', async (req, res) => {
  const adminPass = req.headers['x-admin-password']
  if (adminPass !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' })
  if (!s3Client) return res.status(400).json({ error: 'S3 not configured on server' })
  const { filename, contentType } = req.body || {}
  if (!filename) return res.status(400).json({ error: 'Missing filename' })

  const ext = path.extname(filename)
  const name = path.basename(filename, ext)
  const safeName = name.replace(/[^a-z0-9_-]/gi, '_')
  const key = `${Date.now()}-${safeName}${ext}`

  const params = {
    Bucket: S3_BUCKET,
    Key: key,
    ContentType: contentType || 'application/octet-stream'
  }

  try {
    const command = new PutObjectCommand(params)
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
    const publicUrl = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`
    res.json({ uploadUrl, publicUrl, key })
  } catch (err) {
    console.error('Failed to create presigned URL', err)
    res.status(500).json({ error: 'Failed to create presigned URL' })
  }
})

const HOST_FOR_LOG = process.env.BACKEND_HOST || 'localhost'
app.listen(PORT, () => console.log(`Backend running on http://${HOST_FOR_LOG}:${PORT}`))
