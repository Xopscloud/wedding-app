const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const sqlite3 = require('sqlite3').verbose()
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
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
      image TEXT,
      createdAt TEXT
    )
  `)
})

// Serve uploaded images statically
const UPLOADS_DIR = path.join(__dirname, 'uploads')
app.use('/uploads', express.static(UPLOADS_DIR))

// Multer setup
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

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }) // 10MB

// Helpers
function readMoments(callback){
  db.all('SELECT * FROM moments ORDER BY id DESC', (err, rows) => {
    if (err) return callback(err, [])
    callback(null, rows)
  })
}

function insertMoment(m, callback){
  db.run(
    `INSERT INTO moments (title, description, category, image, createdAt) VALUES (?,?,?,?,?)`,
    [m.title, m.description, m.category, m.image, m.createdAt],
    function(err){
      if (err) return callback(err, null)
      const inserted = { id: this.lastID, ...m }
      callback(null, inserted)
    }
  )
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
app.post('/api/moments', upload.single('image'), (req, res) => {
  try {
    const adminPass = req.headers['x-admin-password']
    if (!process.env.ADMIN_PASSWORD || adminPass !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { title, description, category } = req.body
    if (!req.file) return res.status(400).json({ error: 'Image file is required (field name: image)' })

    const filename = req.file.filename
    const imageUrl = `/uploads/${filename}`

    const newMoment = {
      title: title || '',
      description: description || '',
      category: category || '',
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
  if (!process.env.ADMIN_PASSWORD || adminPass !== process.env.ADMIN_PASSWORD) {
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
  if (!process.env.ADMIN_PASSWORD || adminPass !== process.env.ADMIN_PASSWORD) {
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

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`))
