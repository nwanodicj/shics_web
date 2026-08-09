const pool = require("../database/connection")

const PUBLIC_ANNOUNCEMENT_WHERE = `
  COALESCE(LOWER(role_target), 'all') = 'all'
`

exports.getAll = async (req, res) => {
  const result = await pool.query(`
    SELECT * FROM announcements
    WHERE ${PUBLIC_ANNOUNCEMENT_WHERE}
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
    `SELECT *
     FROM announcements
     WHERE id = $1
       AND ${PUBLIC_ANNOUNCEMENT_WHERE}`,
    [id]
  )

  if (!result.rows[0]) {
    return res.status(404).send("Announcement not found")
  }

  res.render("announcements/view", {
    title: "Announcement",
    announcement: result.rows[0]
  })
}

exports.getLatest = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM announcements
      WHERE ${PUBLIC_ANNOUNCEMENT_WHERE}
      ORDER BY created_at DESC
      LIMIT 5
    `)

    res.json(result.rows)
  } catch (err) {
    console.error("Announcement latest query failed:", err)
    res.status(500).json({ error: "Unable to load latest announcements" })
  }
}