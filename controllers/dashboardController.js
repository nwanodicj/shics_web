const utilities = require("../utilities");
const pool = require("../database/connection")

const dashboardController = {}

/* ===============================
   ADMIN DASHBOARD
================================ */
dashboardController.admin = async function (req, res) {
  try {
    let nav = await utilities.getNav();

    res.render("dashboard/admin", {
      title: "Admin Dashboard",
      nav,
      user: req.session.user,
      lessonPlans: []
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading admin dashboard");
  }
};

/* ===============================
   STAFF DASHBOARD
================================ */
dashboardController.staff = async function (req, res) {
  let nav = await utilities.getNav();

  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [req.session.user.id]
    )

    const user = userResult.rows[0] || req.session.user

    // Get uploaded lessons for this staff member
    const lessons = await pool.query(
      "SELECT * FROM lessons WHERE staff_id = $1 ORDER BY created_at DESC LIMIT 10",
      [req.session.user.id]
    )

    res.render("dashboard/staff", {
      title: "Staff Dashboard",
      nav,
      user: { ...req.session.user, ...user },
      uploadedLessons: lessons.rows || []
    })
  } catch (err) {
    console.error(err)
    res.render("dashboard/staff", {
      title: "Staff Dashboard",
      nav,
      user: req.session.user,
      uploadedLessons: []
    })
  }
};

/* ===============================
   STUDENT DASHBOARD
================================ */
dashboardController.student = async function (req, res) {
  let nav = await utilities.getNav();

  try {
    const studentId = req.session.user.id;

    // Get student info
    const student = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [studentId]
    )

    // Get results
    const results = await pool.query(
      "SELECT * FROM results WHERE student_id = $1 ORDER BY created_at DESC",
      [studentId]
    )

    // Get lesson notes only
    const lessons = await pool.query(
      "SELECT * FROM lessons WHERE type = 'lesson_note' ORDER BY created_at DESC"
    )

    res.render("dashboard/student", {
      title: "Student Dashboard",
      nav,
      user: req.session.user,
      student: student.rows[0] || {},
      results: results.rows || [],
      lessons: lessons.rows || []
    })
  } catch (err) {
    console.error(err)
    res.render("dashboard/student", {
      title: "Student Dashboard",
      nav,
      user: req.session.user,
      student: {},
      results: [],
      lessons: []
    })
  }
};

/* ===============================
   PARENT DASHBOARD
================================ */
dashboardController.parent = async function (req, res) {
  let nav = await utilities.getNav();

  try {
    const parentId = req.session.user.id;
    const userResult = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [parentId]
    )
    const user = userResult.rows[0] || req.session.user

    // Get children
    const children = await pool.query(`
      SELECT u.*
      FROM users u
      JOIN parent_student ps ON u.id = ps.student_id
      WHERE ps.parent_id = $1
    `, [parentId])

    // Get results for all children
    const results = await pool.query(`
      SELECT r.*, u.name
      FROM results r
      JOIN users u ON r.student_id = u.id
      WHERE r.student_id IN (
        SELECT student_id FROM parent_student WHERE parent_id = $1
      )
      ORDER BY r.created_at DESC
    `, [parentId])

    res.render("dashboard/parent", {
      title: "Parent Dashboard",
      nav,
      user: { ...req.session.user, ...user },
      children: children.rows || [],
      results: results.rows || []
    })
  } catch (err) {
    console.error(err)
    res.render("dashboard/parent", {
      title: "Parent Dashboard",
      nav,
      user: req.session.user,
      children: [],
      results: []
    })
  }
};


// GET LIVE STATS
dashboardController.getStats = async (req, res) => {
  try {
    const students = await pool.query("SELECT COUNT(*) FROM users WHERE role='student'")
    const staff = await pool.query("SELECT COUNT(*) FROM users WHERE role='staff'")
    const classes = await pool.query("SELECT COUNT(DISTINCT class) FROM lessons")

    res.json({
      students: students.rows[0].count,
      staff: staff.rows[0].count,
      classes: classes.rows[0].count
    })
  } catch (err) {
    console.error(err)
    res.status(500).send("Error loading stats")
  }
}

module.exports = dashboardController;