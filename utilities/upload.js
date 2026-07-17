/* ******************************************
 * FILE UPLOAD CONFIG (MULTER)
 ******************************************/
const multer = require("multer")
const path = require("path")

// Storage config
const storage = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, "public/uploads/")
  },

  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname)
    cb(null, uniqueName)
  }
})

// File filter (allow documents and image files)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|png|jpg|jpeg|gif|webp/
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase())

  if (ext) {
    return cb(null, true)
  } else {
    cb("Only PDF, DOC, DOCX, or image files are allowed")
  }
}

const upload = multer({ storage, fileFilter })

module.exports = upload