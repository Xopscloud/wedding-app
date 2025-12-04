require('dotenv').config()
const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const sqlite3 = require('sqlite3').verbose()
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

console.log('Backend config:', { PORT, CORS_ORIGIN, ADMIN_PASSWORD_SET: !!process.env.ADMIN_PASSWORD })

app.use(cors({ origin: CORS_ORIGIN }))
app.use(express.json())

// Ensure data folder exists and initialize SQLite DB
const DATA_DIR = path.join(__dirname, 'data')
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

const DB_FILE = path.join(DATA_DIR, 'moments.db')

let db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) {
    console.error('Failed to open DB', err)
    process.exit(1)
  }
  console.log('SQLite DB initialized')
  db.run(`
    CREATE TABLE IF NOT EXISTS moments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      category TEXT,
      section TEXT,
      caption TEXT,
      image TEXT,
      createdAt TEXT
    )
  `, () => {
    // Ensure older DBs are migrated to include new columns
    db.all("PRAGMA table_info('moments')", (err, cols) => {
      if (err) return
      const names = (cols || []).map(c => c.name)
      if (!names.includes('section')) {
        db.run('ALTER TABLE moments ADD COLUMN section TEXT')
      }
      if (!names.includes('caption')) {
        db.run('ALTER TABLE moments ADD COLUMN caption TEXT')
      }
    })
  })
})

// Settings table for small key/value pairs (e.g., landing image)
db.run(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  )
`)

function getSetting(key, cb){
  db.get('SELECT value FROM settings WHERE key = ?', [key], (err, row) => {
    if (err) return cb(err, null)
    cb(null, row ? row.value : null)
  })
}

function setSetting(key, value, cb){
  db.run('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', [key, value], cb)
}

// Decide between local uploads or S3 based on environment
const S3_BUCKET = process.env.S3_BUCKET || ''
const AWS_REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || ''
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || ''
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || ''

let upload
let UPLOADS_DIR
let s3

if (S3_BUCKET && AWS_REGION && AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && S3Client) {
  // Configure AWS S3 client (v3)
  s3Client = new S3Client({ region: AWS_REGION, credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY } })
  // Use memory storage for multer when uploading to S3
  const storage = multer.memoryStorage()
  upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }) // 50MB
  console.log('S3 uploads enabled (v3), bucket:', S3_BUCKET)
} else {
  // Local uploads
  UPLOADS_DIR = path.join(__dirname, 'uploads')
  app.use('/uploads', express.static(UPLOADS_DIR))
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })

  const storage = multer.diskStorage({
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

  upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }) // 50MB
}

// Helpers
function readMoments(callback){
  db.all('SELECT * FROM moments ORDER BY id DESC', (err, rows) => {
    if (err) return callback(err, [])
    callback(null, rows)
  })
}

function insertMoment(m, callback){
  db.run(
    `INSERT INTO moments (title, description, category, section, caption, image, createdAt) VALUES (?,?,?,?,?,?,?)`,
    [m.title, m.description, m.category, m.section || '', m.caption || '', m.image, m.createdAt],
    function(err){
      if (err) return callback(err, null)
      const inserted = { id: this.lastID, ...m }
      callback(null, inserted)
    }
  )
}

function updateMoment(id, fields, callback){
  const sets = []
  const values = []
  if (fields.title !== undefined) { sets.push('title = ?'); values.push(fields.title) }
  if (fields.description !== undefined) { sets.push('description = ?'); values.push(fields.description) }
  if (fields.category !== undefined) { sets.push('category = ?'); values.push(fields.category) }
  if (fields.section !== undefined) { sets.push('section = ?'); values.push(fields.section) }
  if (fields.caption !== undefined) { sets.push('caption = ?'); values.push(fields.caption) }
  if (sets.length === 0) return callback(null)
  values.push(id)
  db.run(`UPDATE moments SET ${sets.join(', ')} WHERE id = ?`, values, callback)
}

function deleteMomentById(id, callback){
  db.run('DELETE FROM moments WHERE id = ?', [id], callback)
}

// Routes
app.get('/api/moments', (req, res) => {
  readMoments((err, moments) => {
    if (err) {
      console.error(err)
      return res.status(500).json({ error: 'Failed to read moments' })
    }
    res.json(moments)
  })
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
      // Upload buffer to S3 v3 and wait for completion
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
        console.error('S3 upload error', err)
        return res.status(500).json({ error: 'Failed to upload to S3' })
      }
    } else {
      const filename = req.file.filename
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

    insertMoment(newMoment, (err, inserted) => {
      if (err) {
        console.error('Insert failed', err)
        return res.status(500).json({ error: 'Failed to insert moment' })
      }
      res.status(201).json(inserted)
    })
  } catch (err) {
    console.error('Upload failed', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/api/moments/:id', (req, res) => {
  db.get('SELECT * FROM moments WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      console.error(err)
      return res.status(500).json({ error: 'Internal server error' })
    }
    if (!row) return res.status(404).json({ error: 'Not found' })
    res.json(row)
  })
})

// Admin endpoints: list and delete moments (protected)
app.get('/api/admin/moments', (req, res) => {
  const adminPass = req.headers['x-admin-password']
  if (adminPass !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  readMoments((err, moments) => {
    if (err) {
      console.error(err)
      return res.status(500).json({ error: 'Internal server error' })
    }
    res.json(moments)
  })
})

app.delete('/api/admin/moments/:id', (req, res) => {
  const adminPass = req.headers['x-admin-password']
  if (adminPass !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const id = req.params.id
  deleteMomentById(id, (err) => {
    if (err) {
      console.error(err)
      return res.status(500).json({ error: 'Internal server error' })
    }
    res.json({ success: true })
  })
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
          console.error('S3 upload error', err)
          return res.status(500).json({ error: 'Failed to upload to S3' })
        }
      } else {
        const filename = file.filename
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
      insertMoment(newMoment, (err, row) => {
        if (err) console.error('Insert failed', err)
      })
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
  if (req.file) {
    if (s3Client && req.file.buffer) {
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
      try {
        await s3Client.send(new PutObjectCommand(params))
        fields.image = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`
      } catch (err) {
        console.error('S3 upload error', err)
        return res.status(500).json({ error: 'Failed to upload replacement image' })
      }
    } else if (req.file.filename) {
      fields.image = `/uploads/${req.file.filename}`
    }
  }

  updateMoment(id, fields, (err) => {
    if (err) {
      console.error('Update failed', err)
      return res.status(500).json({ error: 'Internal server error' })
    }
    db.get('SELECT * FROM moments WHERE id = ?', [id], (err, row) => {
      if (err) return res.status(500).json({ error: 'Internal server error' })
      res.json(row)
    })
  })
})

// Admin endpoint to upload landing page image
app.post('/api/admin/landing-image', upload.single('image'), async (req, res) => {
  try {
    const adminPass = req.headers['x-admin-password']
    if (adminPass !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    if (!req.file) return res.status(400).json({ error: 'Image file is required (field name: image)' })
    let imageUrl = ''
    if (s3Client && req.file && req.file.buffer) {
      const ext = path.extname(req.file.originalname)
      const name = path.basename(req.file.originalname, ext)
      const safeName = name.replace(/[^a-z0-9_-]/gi, '_')
      const key = `${Date.now()}-${safeName}${ext}`
      const params = { Bucket: S3_BUCKET, Key: key, Body: req.file.buffer, ContentType: req.file.mimetype }
      try{
        await s3Client.send(new PutObjectCommand(params))
        imageUrl = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`
      }catch(err){
        console.error('S3 upload error', err)
        return res.status(500).json({ error: 'Failed to upload to S3' })
      }
    } else {
      const filename = req.file.filename
      imageUrl = `/uploads/${filename}`
    }
    setSetting('landing_image', imageUrl, (err) => {
      if (err) {
        console.error('Failed to set setting', err)
        return res.status(500).json({ error: 'Failed to save setting' })
      }
      res.status(201).json({ image: imageUrl })
    })
  } catch (err) {
    console.error('Landing upload failed', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Public endpoint to get landing image (falls back to default static image)
app.get('/api/settings/landing-image', (req, res) => {
  getSetting('landing_image', (err, value) => {
    if (err) { console.error('Failed to read setting', err); return res.status(500).json({ error: 'Internal server error' }) }
    if (!value) return res.json({ image: '/images/landing/DSC03522.JPG' })
    res.json({ image: value })
  })
})

// Public: list all settings
app.get('/api/settings', (req, res) => {
  db.all('SELECT key, value FROM settings', (err, rows) => {
    if (err) {
      console.error('Failed to list settings', err)
      return res.status(500).json({ error: 'Internal server error' })
    }
    const out = {}
    if (Array.isArray(rows)) {
      rows.forEach(r => { out[r.key] = r.value })
    } else {
      // Defensive fallback: if rows isn't an array, log and return empty object
      console.warn('Unexpected settings rows type:', typeof rows, rows)
    }
    res.json(out)
  })
})

// Public: get single setting by key
app.get('/api/settings/:key', (req, res) => {
  const key = req.params.key
  getSetting(key, (err, value) => {
    if (err) { console.error('Failed to read setting', err); return res.status(500).json({ error: 'Internal server error' }) }
    res.json({ value: value })
  })
})

// Admin: set a setting key/value
app.post('/api/admin/settings', (req, res) => {
  const adminPass = req.headers['x-admin-password']
  if (adminPass !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' })
  const { key, value } = req.body || {}
  if (!key) return res.status(400).json({ error: 'Missing key' })
  setSetting(key, value || '', (err) => {
    if (err) { console.error('Failed to set setting', err); return res.status(500).json({ error: 'Internal server error' }) }
    res.json({ success: true })
  })
})

// Admin: generate a presigned PUT URL for direct S3 uploads (if S3 is configured)
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
