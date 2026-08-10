// AUTO-COMMENT: File Overview - models/galleryModel.js
// Purpose: Data layer: persistence and data access logic.
const pool = require("../database/connection")

const getAllGalleryImages = async () => {
  return pool.query(`
    SELECT id, name, description, image_url, created_at
    FROM gallery_images
    ORDER BY created_at DESC
  `)
}

module.exports = {
  getAllGalleryImages
}
