/* ******************************************
 * PARENT CONTROLLER
 ******************************************/
const fs = require("fs")
const path = require("path")
const pool = require("../database/connection")

const parentController = {}

async function getUserColumns() {
  const result = await pool.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'users'
  `)

  return new Set(result.rows.map((row) => row.column_name.toLowerCase()))
}

parentController.ensureProfileColumns = async function () {
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
   PARENT DASHBOARD
========================================= */
parentController.buildDashboard = async function (req, res) {

  const parentId = req.session.user.id

  try {

    // 1️⃣ Get children
    const children = await pool.query(`
      SELECT u.*
      FROM users u
      JOIN parent_student ps ON u.id = ps.student_id
      WHERE ps.parent_id = $1
    `, [parentId])

    // 2️⃣ Get results for all children
    const results = await pool.query(`
      SELECT r.*, u.name
      FROM results r
      JOIN users u ON r.student_id = u.id
      WHERE r.student_id IN (
        SELECT student_id FROM parent_student WHERE parent_id = $1
      )
    `, [parentId])

    res.render("parent/dashboard", {
      title: "Parent Dashboard",
      children: children.rows,
      results: results.rows
    })

  } catch (err) {
    console.error(err)
    res.send("Error loading parent dashboard")
  }
}

const generateReportCard = require("../utilities/pdfGenerator")

/* =========================================
   DOWNLOAD CHILD REPORT (PARENT)
========================================= */
parentController.downloadChildReport = async function (req, res) {

  const { studentId } = req.params

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

parentController.updateProfile = async function (req, res) {
  const parentId = req.session.user.id
  const { phone = "", address = "", date_of_birth = "", guardian_name = "", bio = "" } = req.body

  try {
    await parentController.ensureProfileColumns()

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
    values.push(parentId)

    await pool.query(
      `UPDATE users SET ${setClauses.join(", ")} WHERE id = $${fields.length + 1}`,
      values
    )

    res.redirect("/dashboard/parent")
  } catch (err) {
    console.error(err)
    res.status(500).send("Error updating profile")
  }
}

module.exports = parentController