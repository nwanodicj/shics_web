/* ******************************************
 * STUDENT CONTROLLER
 ******************************************/
const pool = require("../database/connection")

const studentController = {}

studentController.ensureProfileColumns = async function () {
  const columns = [
    ["phone", "VARCHAR(30)"],
    ["address", "TEXT"],
    ["date_of_birth", "DATE"],
    ["guardian_name", "VARCHAR(100)"],
    ["bio", "TEXT"],
    ["profile_picture", "TEXT"]
  ]

  for (const [columnName, definition] of columns) {
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${columnName} ${definition}`)
  }
}

/* =========================================
   STUDENT DASHBOARD
========================================= */
studentController.buildDashboard = async function (req, res) {

  const studentId = req.session.user.id

  try {

    // 1️⃣ Student info
    const student = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [studentId]
    )

    // 2️⃣ Results
    const results = await pool.query(
      "SELECT * FROM results WHERE student_id = $1",
      [studentId]
    )

    // 3️⃣ Lesson notes ONLY
    const lessons = await pool.query(
      "SELECT * FROM lessons WHERE type = 'lesson_note' ORDER BY created_at DESC"
    )

    res.render("student/dashboard", {
      title: "Student Dashboard",
      student: student.rows[0],
      results: results.rows,
      lessons: lessons.rows
    })

  } catch (err) {
    console.error(err)
    res.send("Error loading student dashboard")
  }
}

/* =========================================
   GET LESSON NOTES FOR STUDENT
========================================= */
studentController.getLessonNotes = async function (req, res) {

  try {

    const sql = `
      SELECT * FROM lessons
      WHERE type = 'lesson_note'
      ORDER BY created_at DESC
    `

    const result = await pool.query(sql)

    res.render("student/dashboard", {
      lessons: result.rows
    })

  } catch (err) {
    console.error(err)
    res.send("Error loading lessons")
  }
}

const generateReportCard = require("../utilities/pdfGenerator")

/* =========================================
   DOWNLOAD REPORT (STUDENT)
========================================= */
studentController.downloadReport = async function (req, res) {

  const studentId = req.session.user.id

  try {

    const student = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [studentId]
    )

    const results = await pool.query(
      "SELECT * FROM results WHERE student_id = $1",
      [studentId]
    )

    generateReportCard(res, student.rows[0], results.rows)

  } catch (err) {
    console.error(err)
    res.send("Error generating report")
  }
}

studentController.updateProfile = async function (req, res) {
  const studentId = req.session.user.id
  const { phone = "", address = "", date_of_birth = "", guardian_name = "", bio = "" } = req.body

  try {
    await studentController.ensureProfileColumns()

    const fields = [
      ["phone", phone || null],
      ["address", address || null],
      ["date_of_birth", date_of_birth || null],
      ["guardian_name", guardian_name || null],
      ["bio", bio || null]
    ]

    if (req.file) {
      fields.push(["profile_picture", `/uploads/${req.file.filename}`])
    }

    const setClauses = fields.map((_, index) => `${fields[index][0]} = $${index + 1}`)
    const values = fields.map((field) => field[1])
    values.push(studentId)

    await pool.query(
      `UPDATE users SET ${setClauses.join(", ")} WHERE id = $${fields.length + 1}`,
      values
    )

    res.redirect("/dashboard/student")
  } catch (err) {
    console.error(err)
    res.status(500).send("Error updating profile")
  }
}

module.exports = studentController