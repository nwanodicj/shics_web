/* ******************************************
 * STUDENT CONTROLLER
 ******************************************/
const pool = require("../database/connection")

const studentController = {}

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

//exports.getStudentProfile = async (req, res) => {
//  const studentId = req.params.id
//
//  try {
//    // 1. Student info
//    const studentResult = await pool.query(
//      "SELECT id, name FROM users WHERE id = $1 AND role = 'student'",
//      [studentId]
//    )
//
//    // 2. Results
//    const results = await pool.query(
//      "SELECT subject, score, term FROM results WHERE student_id = $1",
//      [studentId]
//    )
//
//    // 3. Attendance
//    const attendance = await pool.query(
//      "SELECT action, date, time FROM attendance WHERE staff_id = $1",
//      [studentId]
//    )
//
//    if (studentResult.rows.length === 0) {
//      return res.send("Student not found")
//    }
//
//    res.render("pages/student-profile", {
//      title: "Student Profile",
//      student: studentResult.rows[0],
//      results: results.rows,
//      attendance: attendance.rows
//    })
//
//  } catch (err) {
//    console.error(err)
//    res.send("Error loading student profile")
//  }
//}

module.exports = studentController