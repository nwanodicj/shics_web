const pool = require("../database/connection")

exports.getAll = async (req, res) => {
  const result = await pool.query(`
    SELECT * FROM announcements
    ORDER BY created_at DESC
  `)

  res.render("announcements/index", {
    title: "Announcements",
    announcements: result.rows
  })
}

exports.getOne = async (req, res) => {
  const { id } = req.params

  const result = await pool.query(
    "SELECT * FROM announcements WHERE id = $1",
    [id]
  )

  res.render("announcements/view", {
    title: "Announcement",
    announcement: result.rows[0]
  })
}

exports.getLatest = async (req, res) => {
  const result = await pool.query(`
    SELECT * FROM announcements
    ORDER BY created_at DESC
    LIMIT 5
  `)

  res.json(result.rows)
}