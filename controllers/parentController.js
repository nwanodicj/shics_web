/* ******************************************
 * PARENT CONTROLLER
 ******************************************/
const pool = require("../database/connection")

const parentController = {}

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

module.exports = parentController