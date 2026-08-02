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
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" })
    }

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
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" })
    }

    res.status(500).json({ error: "Error adding student" })
  }
}

/* =========================================
   ADD STAFF
========================================= */
adminController.addStaff = async function (req, res) {
  const { name, email, password, class_id, subject_id } = req.body

  try {
    if (!name || !email || !password || !class_id || !subject_id) {
      return res.status(400).json({ error: "Name, email, password, class and subject are required" })
    }

    const client = await pool.connect()

    try {
      await client.query("BEGIN")

      const salt = await bcryptjs.genSalt(10)
      const hashedPassword = await bcryptjs.hash(password, salt)

      const userSql = `
        INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, 'staff')
        RETURNING id, name, email, role
      `

      const userResult = await client.query(userSql, [name, email, hashedPassword])
      const staff = userResult.rows[0]

      const assignmentSql = `
        INSERT INTO staff_assignments (staff_id, class_id, subject_id)
        VALUES ($1, $2, $3)
      `

      await client.query(assignmentSql, [staff.id, class_id, subject_id])

      await client.query("COMMIT")

      res.status(201).json({
        success: true,
        message: "Staff added successfully",
        staff
      })
    } catch (innerErr) {
      await client.query("ROLLBACK")
      throw innerErr
    } finally {
      client.release()
    }
  } catch (err) {
    console.error("Error adding staff:", err)
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" })
    }

    res.status(500).json({ error: "Error adding staff" })
  }
}

/* =========================================
   DELETE STUDENT
========================================= */
adminController.deleteStudent = async function (req, res) {
  const { id } = req.params

  try {
    await pool.query("DELETE FROM users WHERE id = $1 AND role = 'student'", [id])
    res.redirect("/admin/students")
  } catch (err) {
    console.error(err)
    res.status(500).send("Error deleting student")
  }
}

/* =========================================
   DELETE STAFF
========================================= */
adminController.deleteStaff = async function (req, res) {
  const { id } = req.params

  try {
    await pool.query("DELETE FROM users WHERE id = $1 AND role = 'staff'", [id])
    res.redirect("/admin/staff")
  } catch (err) {
    console.error(err)
    res.status(500).send("Error deleting staff")
  }
}

/* =========================================
   ADMIN DASHBOARD
========================================= */
adminController.dashboard = async function (req, res) {
  try {
    const lessonPlansResult = await pool.query(`
      SELECT * FROM lessons
      WHERE type = 'lesson_plan'
      ORDER BY created_at DESC
    `)

    res.render("dashboard/admin", {
      title: "Admin Dashboard",
      user: req.session.user,
      currentPage: "dashboard",
      lessonPlans: lessonPlansResult.rows
    })
  } catch (err) {
    console.error(err)
    res.status(500).send("Error loading admin dashboard")
  }
}

/* =========================================
   STUDENT MANAGEMENT PAGE
========================================= */
adminController.getStudents = async function (req, res) {
  try {
    const result = await pool.query(`
      SELECT id, name, email, created_at
      FROM users
      WHERE role = 'student'
      ORDER BY created_at DESC
    `)

    res.render("dashboard/admin-students", {
      title: "Student Management",
      user: req.session.user,
      currentPage: "students",
      students: result.rows
    })
  } catch (err) {
    console.error(err)
    res.status(500).send("Error loading students")
  }
}

/* =========================================
   STAFF MANAGEMENT PAGE
========================================= */
adminController.getStaff = async function (req, res) {
  try {
    const result = await pool.query(`
      SELECT id, name, email, created_at
      FROM users
      WHERE role = 'staff'
      ORDER BY created_at DESC
    `)

    const classes = await pool.query(`
      SELECT id, name
      FROM classes
      ORDER BY name ASC
    `)

    const subjects = await pool.query(`
      SELECT id, name
      FROM subjects
      ORDER BY name ASC
    `)

    const assignments = await pool.query(`
      SELECT sa.id, sa.staff_id, u.name AS staff_name, c.name AS class_name, s.name AS subject_name, sa.created_at
      FROM staff_assignments sa
      JOIN users u ON u.id = sa.staff_id
      JOIN classes c ON c.id = sa.class_id
      JOIN subjects s ON s.id = sa.subject_id
      ORDER BY u.name ASC, c.name ASC, s.name ASC
    `)

    res.render("dashboard/admin-staff", {
      title: "Staff Management",
      user: req.session.user,
      currentPage: "staff",
      staff: result.rows,
      classes: classes.rows,
      subjects: subjects.rows,
      assignments: assignments.rows
    })
  } catch (err) {
    console.error(err)
    res.status(500).send("Error loading staff")
  }
}

/* =========================================
   PARENT MANAGEMENT PAGE
========================================= */
adminController.getParents = async function (req, res) {
  try {
    const parents = await pool.query(`
      SELECT id, name, email, created_at
      FROM users
      WHERE role = 'parent'
      ORDER BY created_at DESC
    `)

    const students = await pool.query(`
      SELECT id, name, email, created_at
      FROM users
      WHERE role = 'student'
      ORDER BY created_at DESC
    `)

    const connections = await pool.query(`
      SELECT ps.id, p.name AS parent_name, s.name AS student_name
      FROM parent_student ps
      JOIN users p ON p.id = ps.parent_id
      JOIN users s ON s.id = ps.student_id
      ORDER BY ps.id DESC
    `)

    res.render("dashboard/admin-parents", {
      title: "Parent Management",
      user: req.session.user,
      currentPage: "parents",
      parents: parents.rows,
      students: students.rows,
      parentLinks: connections.rows
    })
  } catch (err) {
    console.error(err)
    res.status(500).send("Error loading parent management")
  }
}

/* =========================================
   LESSON APPROVAL PAGE
========================================= */
adminController.getLessonPlans = async function (req, res) {
  try {
    const result = await pool.query(`
      SELECT * FROM lessons
      WHERE type = 'lesson_plan'
      ORDER BY created_at DESC
    `)

    res.render("dashboard/admin-lessons", {
      title: "Lesson Plan Approval",
      user: req.session.user,
      currentPage: "lessons",
      lessonPlans: result.rows
    })
  } catch (err) {
    console.error(err)
    res.status(500).send("Error loading lesson plans")
  }
}

/* =========================================
   ANNOUNCEMENTS PAGE
========================================= */
adminController.getAnnouncements = async function (req, res) {
  try {
    const result = await pool.query(`
      SELECT * FROM announcements
      ORDER BY created_at DESC
    `)

    res.render("dashboard/admin-announcements", {
      title: "Announcements",
      user: req.session.user,
      currentPage: "announcements",
      announcements: result.rows
    })
  } catch (err) {
    console.error(err)
    res.status(500).send("Error loading announcements")
  }
}

/* =========================================
   GALLERY MANAGEMENT PAGE
========================================= */
adminController.getGallery = async function (req, res) {
  try {
    const result = await pool.query(`
      SELECT id, name, description, image_url, created_at
      FROM gallery_images
      ORDER BY created_at DESC
    `)

    res.render("dashboard/admin-gallery", {
      title: "Gallery Management",
      user: req.session.user,
      currentPage: "gallery",
      galleryImages: result.rows
    })
  } catch (err) {
    console.error(err)
    res.status(500).send("Error loading gallery management")
  }
}

/* =========================================
   RESULTS MANAGEMENT PAGE
========================================= */
adminController.getResults = async function (req, res) {
  try {
    const students = await pool.query(`
      SELECT id, name
      FROM users
      WHERE role = 'student'
      ORDER BY name ASC
    `)

    const results = await pool.query(`
      SELECT r.*, u.name AS student_name
      FROM results r
      JOIN users u ON u.id = r.student_id
      ORDER BY r.created_at DESC
    `)

    res.render("dashboard/admin-results", {
      title: "Results Management",
      user: req.session.user,
      currentPage: "results",
      students: students.rows,
      results: results.rows
    })
  } catch (err) {
    console.error(err)
    res.status(500).send("Error loading results management")
  }
}

/* =========================================
   REPORTS PAGE
========================================= */
adminController.getReports = async function (req, res) {
  try {
    const reportSummaries = await pool.query(`
      SELECT r.student_id, u.name AS student_name, r.term,
        COUNT(*) AS result_count,
        AVG(r.score)::numeric(5,2) AS average_score,
        MIN(r.score) AS min_score,
        MAX(r.score) AS max_score
      FROM results r
      JOIN users u ON u.id = r.student_id
      GROUP BY r.student_id, u.name, r.term
      ORDER BY u.name ASC, r.term ASC
    `)

    const totals = await pool.query(`
      SELECT COUNT(*) AS total_results,
        AVG(score)::numeric(5,2) AS average_score
      FROM results
    `)

    res.render("dashboard/admin-reports", {
      title: "Reports",
      user: req.session.user,
      currentPage: "reports",
      reportSummaries: reportSummaries.rows,
      reportTotals: totals.rows[0]
    })
  } catch (err) {
    console.error(err)
    res.status(500).send("Error loading reports")
  }
}

/* =========================================
   UPLOAD GALLERY IMAGE
========================================= */
adminController.addGalleryImage = async function (req, res) {
  const { name, description } = req.body

  if (!name || !description || !req.file) {
    return res.status(400).send("Name, description, and image are required")
  }

  try {
    const imageUrl = "/uploads/" + req.file.filename

    await pool.query(
      `INSERT INTO gallery_images (name, description, image_url)
       VALUES ($1, $2, $3)`,
      [name, description, imageUrl]
    )

    res.redirect("/admin/gallery")
  } catch (err) {
    console.error(err)
    res.status(500).send("Error saving gallery image")
  }
}

/* =========================================
   DELETE GALLERY IMAGE
========================================= */
adminController.deleteGalleryImage = async function (req, res) {
  const { id } = req.params

  try {
    await pool.query("DELETE FROM gallery_images WHERE id = $1", [id])
    res.redirect("/admin/gallery")
  } catch (err) {
    console.error(err)
    res.status(500).send("Error deleting gallery image")
  }
}

/* =========================================
   LINK PARENT â†” STUDENT
========================================= */
adminController.linkParentStudent = async function (req, res) {

  const { parent_id, student_id } = req.body

  try {
    const sql = `
      INSERT INTO parent_student (parent_id, student_id)
      VALUES ($1, $2)
    `

    await pool.query(sql, [parent_id, student_id])
    res.redirect("/admin/parents")
  } catch (err) {
    console.error(err)
    res.status(500).send("Error linking parent and student")
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

    res.redirect("/admin/results")

  } catch (err) {
    console.error(err)
    res.send("Error adding result")
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

    const io = socketUtil.getIO()

    io.to(role_target).emit("notification", {
      message: `ðŸ“¢ ${title}: ${message}`
    })

    res.redirect("/admin/announcements")

  } catch (err) {
    console.error(err)
    res.status(500).send("Error creating announcement")
  }
}

/* =========================================   SEND NOTIFICATION
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
   APPROVE / REJECT LESSON PLAN + NOTIFY STAFF
========================================= */
adminController.updateLessonStatus = async function (req, res) {

  const { lessonId, status } = req.body // approved / rejected

  try {

    // 1ï¸âƒ£ Update lesson status
    const lessonQuery = `
      UPDATE lessons
      SET status = $1
      WHERE id = $2
      RETURNING staff_id, title
    `

    const lessonResult = await pool.query(lessonQuery, [status, lessonId])
    const lesson = lessonResult.rows[0]

    // 2ï¸âƒ£ Save notification in DB
    const message = `Your lesson "${lesson.title}" has been ${status}`

    const notifyQuery = `
      INSERT INTO notifications (user_id, message)
      VALUES ($1, $2)
    `
    await pool.query(notifyQuery, [lesson.staff_id, message])

    // 3ï¸âƒ£ ðŸ”¥ SEND REAL-TIME NOTIFICATION
    const io = socketUtil.getIO() // âœ… get socket instance

    io.to(`user_${lesson.staff_id}`).emit("notification", {
      message
    })

    res.redirect("/admin/dashboard")

  } catch (err) {
    console.error(err)
    res.send("Error updating lesson status")
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


