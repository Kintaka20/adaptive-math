import { Router } from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'

const router = Router()

// Konfigurasi Cloudinary dari variabel lingkungan
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Konfigurasi Multer untuk menyimpan file di memory sementara (RAM)
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
})

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Tidak ada file yang diunggah' })
    }

    // Pastikan API Key tersedia
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        message: 'Cloudinary belum dikonfigurasi di backend (.env)' 
      })
    }

    // Menentukan tipe resource Cloudinary (gambar/video menggunakan auto, dokumen/PDF menggunakan raw)
    const isDocument = req.file.mimetype.includes('pdf') || 
                       req.file.mimetype.includes('msword') || 
                       req.file.mimetype.includes('wordprocessingml') ||
                       req.file.mimetype.includes('document')
    
    const resourceType = isDocument ? 'raw' : 'auto'

    const ext = req.file.originalname.split('.').pop()
    const options: any = {
      folder: 'adaptive_math',
      resource_type: resourceType,
    }
    
    if (resourceType === 'raw' && ext) {
      options.public_id = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`
    }

    // Mengunggah buffer dari memory ke Cloudinary menggunakan stream
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error)
          return res.status(500).json({ success: false, message: 'Gagal mengunggah ke cloud', error })
        }
        
        if (!result) {
          return res.status(500).json({ success: false, message: 'Gagal mendapatkan hasil dari cloud' })
        }

        // Return URL aman HTTPS dari gambar
        res.json({ success: true, data: { url: result.secure_url } })
      }
    )

    // Alirkan buffer file ke fungsi upload Cloudinary
    uploadStream.end(req.file.buffer)

  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server saat mengunggah gambar' })
  }
})

export default router
