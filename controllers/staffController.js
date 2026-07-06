/* ******************************************
 * STAFF CONTROLLER
 ******************************************/

const pool = require("../database/connection")

const staffController = {}

/* =========================================
   UPLOAD LESSON (NOTE / PLAN)
========================================= */
staffController.uploadLesson = async function (req, res) {

  const { title, subject, class: className, term, type } = req.body
  const staffId = req.session.user.id

  try {

    // file path from multer
    const fileUrl = "/uploads/" + req.file.filename

    const sql = `
      INSERT INTO lessons
      (staff_id, title, subject, class, term, type, file_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `

    await pool.query(sql, [
      staffId,
      title,
      subject,
      className,
      term,
      type, // lesson_note or lesson_plan
      fileUrl
    ])

    res.redirect("/staff/dashboard")

  } catch (err) {
    console.error(err)
    res.send("Error uploading lesson")
  }
}

/* =========================================
   GET STAFF NOTIFICATIONS
========================================= */
staffController.getNotifications = async function (req, res) {

  const staffId = req.session.user.id

  try {

    const result = await pool.query(`
      SELECT * FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [staffId])

    res.render("staff/notifications", {
      notifications: result.rows
    })

  } catch (err) {
    console.error(err)
    res.send("Error loading notifications")
  }
}

module.exports = staffController