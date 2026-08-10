// AUTO-COMMENT: File Overview - controllers/staffController.js
// Purpose: Controller layer: HTTP handlers and request/response orchestration.
/* ******************************************
 * STAFF CONTROLLER
 ******************************************/

const fs = require("fs")
const path = require("path")
const pool = require("../database/connection")
const notificationModel = require("../models/notificationModel")
const socketUtil = require("../utilities/socket")

const staffController = {}

async function getUserColumns() {
  const result = await pool.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'users'
  `)

  return new Set(result.rows.map((row) => row.column_name.toLowerCase()))
}

staffController.ensureProfileColumns = async function () {
  const columns = [
    ["phone", "VARCHAR(30)"],
    ["address", "TEXT"],
    ["date_of_birth", "DATE"],
    ["guardian_name", "VARCHAR(100)"],
    ["bio", "TEXT"],
    ["profile_picture", "TEXT"]
  ]

  try {
    const existingColumns = await getUserColumns()

    for (const [columnName, definition] of columns) {
      if (!existingColumns.has(columnName)) {
        await pool.query(`ALTER TABLE users ADD COLUMN ${columnName} ${definition}`)
      }
    }
  } catch (err) {
    console.warn("Unable to ensure profile columns:", err.message)
  }
}

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

    const materialLabel = type === "lesson_note" ? "lesson note" : "lesson plan"
    const notifyMessage = `New ${materialLabel} uploaded by ${req.session.user.name}: "${title}"`

    await notificationModel.createNotification({
      role_target: "admin",
      message: notifyMessage
    })

    const io = socketUtil.getIO()
    io.to("admin").emit("notification", {
      message: notifyMessage
    })

    res.redirect("/dashboard/staff/overview")

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
  const role = req.session.user.role || "staff"

  try {
    const result = await notificationModel.getUserNotifications(staffId, role)

    if (req.accepts("json") && !req.accepts("html")) {
      return res.json({ notifications: result.rows })
    }

    res.render("staff/notifications", {
      layout: false,
      notifications: result.rows
    })

  } catch (err) {
    console.error(err)
    res.send("Error loading notifications")
  }
}

staffController.updateProfile = async function (req, res) {
  const staffId = req.session.user.id
  const { phone = "", address = "", date_of_birth = "", guardian_name = "", bio = "" } = req.body

  try {
    await staffController.ensureProfileColumns()

    const existingColumns = await getUserColumns()
    const fields = []

    for (const [columnName, value] of [
      ["phone", phone || null],
      ["address", address || null],
      ["date_of_birth", date_of_birth || null],
      ["guardian_name", guardian_name || null],
      ["bio", bio || null]
    ]) {
      if (existingColumns.has(columnName)) {
        fields.push([columnName, value])
      }
    }

    if (req.file) {
      const uploadDir = path.join(__dirname, "..", "public", "uploads")
      fs.mkdirSync(uploadDir, { recursive: true })
      fields.push(["profile_picture", `/uploads/${req.file.filename}`])
    }

    if (fields.length === 0) {
      return res.status(400).send("No profile fields were available to update")
    }

    const setClauses = fields.map((_, index) => `${fields[index][0]} = $${index + 1}`)
    const values = fields.map((field) => field[1])
    values.push(staffId)

    await pool.query(
      `UPDATE users SET ${setClauses.join(", ")} WHERE id = $${fields.length + 1}`,
      values
    )

    res.redirect("/dashboard/staff/profile")
  } catch (err) {
    console.error(err)
    res.status(500).send("Error updating profile")
  }
}

module.exports = staffController