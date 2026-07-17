/* ******************************************
 * ADMIN CONTROLLER
 ******************************************/

const pool = require("../database/connection")
const socketUtil = require("../utilities/socket")
const bcryptjs = require("bcryptjs")

const adminController = {}

/* =========================================
   ADD STUDENT
========================================= */
adminController.addStudent = async function (req, res) {
  const { name, email, password } = req.body

  try {
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" })
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10)
    const hashedPassword = await bcryptjs.hash(password, salt)

    const sql = `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, 'student')
      RETURNING id, name, email, role
    `

    const result = await pool.query(sql, [name, email, hashedPassword])

    res.status(201).json({
      success: true,
      message: "Student added successfully",
      student: result.rows[0]
    })

  } catch (err) {
    console.error("Error adding student:", err)
    
    // Handle duplicate email
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" })
    }

    res.status(500).json({ error: "Error adding student" })
  }
}

/* =========================================
   DELETE STUDENT
========================================= */
adminController.deleteStudent = async function (req, res) {

  const { id } = req.params

  try {

    await pool.query("DELETE FROM users WHERE id = $1 AND role = 'student'", [id])

    res.redirect("/admin/dashboard")

  } catch (err) {
    console.error(err)
    res.send("Error deleting student")
  }
}

/* =========================================
   LINK PARENT ↔ STUDENT
========================================= */
adminController.linkParentStudent = async function (req, res) {

  const { parent_id, student_id } = req.body

  try {

    const sql = `
      INSERT INTO parent_student (parent_id, student_id)
      VALUES ($1, $2)
    `

    await pool.query(sql, [parent_id, student_id])

    res.redirect("/admin/dashboard")

  } catch (err) {
    console.error(err)
    res.send("Error linking parent and student")
  }
}

/* =========================================
   ADD RESULT
========================================= */
adminController.addResult = async function (req, res) {

  const { student_id, subject, score, term } = req.body

  try {

    const sql = `
      INSERT INTO results (student_id, subject, score, term)
      VALUES ($1, $2, $3, $4)
    `

    await pool.query(sql, [student_id, subject, score, term])

    res.redirect("/admin/dashboard")

  } catch (err) {
    console.error(err)
    res.send("Error adding result")
  }
}

/* =========================================
   APPROVE / REJECT LESSON PLAN
========================================= */
adminController.updateLessonStatus = async function (req, res) {

  const { lessonId, status } = req.body // approved / rejected

  try {

    const sql = `
      UPDATE lessons
      SET status = $1
      WHERE id = $2
    `

    await pool.query(sql, [status, lessonId])

    res.redirect("/admin/dashboard")

  } catch (err) {
    console.error(err)
    res.send("Error updating lesson status")
  }
}

/* =========================================
   CREATE ANNOUNCEMENT + REAL-TIME BROADCAST
========================================= */
adminController.createAnnouncement = async function (req, res) {

  const { title, message, role_target } = req.body

  try {

    const sql = `
      INSERT INTO announcements (title, message, role_target)
      VALUES ($1, $2, $3)
    `

    await pool.query(sql, [title, message, role_target])

    // 🔥 SEND REAL-TIME TO ROLE
    const io = socketUtil.getIO()

    io.to(role_target).emit("notification", {
      message: `📢 ${title}: ${message}`
    })

    res.redirect("/admin/dashboard")

  } catch (err) {
    console.error(err)
    res.send("Error creating announcement")
  }
}

/* =========================================
   SEND NOTIFICATION
========================================= */
adminController.sendNotification = async function (req, res) {

  const { message, role_target } = req.body

  try {

    const sql = `
      INSERT INTO notifications (message, role_target)
      VALUES ($1, $2)
    `

    await pool.query(sql, [message, role_target])

    res.redirect("/admin/dashboard")

  } catch (err) {
    console.error(err)
    res.send("Error sending notification")
  }
}

/* =========================================
   GET LESSON PLANS (ADMIN VIEW)
========================================= */
adminController.getLessonPlans = async function (req, res) {

  try {

    const result = await pool.query(`
      SELECT * FROM lessons
      WHERE type = 'lesson_plan'
      ORDER BY created_at DESC
    `)

    // IMPORTANT: pass data to view
    res.render("admin/dashboard", {
      title: "Admin Dashboard",
      lessonPlans: result.rows
    })

  } catch (err) {
    console.error(err)
    res.send("Error loading lesson plans")
  }
}

/* =========================================
   APPROVE / REJECT LESSON PLAN + NOTIFY STAFF
========================================= */
adminController.updateLessonStatus = async function (req, res) {

  const { lessonId, status } = req.body // approved / rejected

  try {

    // 1️⃣ Update lesson status
    const lessonQuery = `
      UPDATE lessons
      SET status = $1
      WHERE id = $2
      RETURNING staff_id, title
    `

    const lessonResult = await pool.query(lessonQuery, [status, lessonId])
    const lesson = lessonResult.rows[0]

    // 2️⃣ Save notification in DB
    const message = `Your lesson "${lesson.title}" has been ${status}`

    const notifyQuery = `
      INSERT INTO notifications (user_id, message)
      VALUES ($1, $2)
    `
    await pool.query(notifyQuery, [lesson.staff_id, message])

    // 3️⃣ 🔥 SEND REAL-TIME NOTIFICATION
    const io = socketUtil.getIO() // ✅ get socket instance

    io.to(`user_${lesson.staff_id}`).emit("notification", {
      message
    })

    res.redirect("/admin/dashboard")

  } catch (err) {
    console.error(err)
    res.send("Error updating lesson status")
  }
}

exports.getAnalytics = async (req, res) => {
  try {
    const students = await db.query("SELECT COUNT(*) FROM users WHERE role='student'")
    const staff = await db.query("SELECT COUNT(*) FROM users WHERE role='staff'")
    const attendance = await db.query(`
      SELECT COUNT(*) FROM attendance 
      WHERE date = CURRENT_DATE
    `)
    const pendingLessons = await db.query(`
      SELECT COUNT(*) FROM lessons WHERE status='pending'
    `)

    res.json({
      students: students.rows[0].count,
      staff: staff.rows[0].count,
      attendance: attendance.rows[0].count,
      pendingLessons: pendingLessons.rows[0].count
    })

  } catch (err) {
    console.error(err)
    res.status(500).send("Error loading analytics")
  }
}

adminController.getAnalytics = async (req, res) => {
  try {
    const students = await pool.query("SELECT COUNT(*) FROM users WHERE role='student'")
    const staff = await pool.query("SELECT COUNT(*) FROM users WHERE role='staff'")
    const attendance = await pool.query("SELECT COUNT(*) FROM attendance WHERE date = CURRENT_DATE")
    const pendingLessons = await pool.query("SELECT COUNT(*) FROM lessons WHERE status='pending'")

    res.json({
      students: students.rows[0].count,
      staff: staff.rows[0].count,
      attendance: attendance.rows[0].count,
      pendingLessons: pendingLessons.rows[0].count
    })

  } catch (err) {
    console.error(err)
    res.status(500).send("Error loading analytics")
  }
}

module.exports = adminController