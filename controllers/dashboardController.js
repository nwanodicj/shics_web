const utilities = require("../utilities");
const pool = require("../database/connection")
const notificationModel = require("../models/notificationModel")
const reportCardModel = require("../models/reportCardModel")

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
    const activeSection = req.params.section || "overview"

    if (activeSection === "notifications") {
      await notificationModel.markAllUserNotificationsAsRead(req.session.user.id, "staff")
      res.locals.notificationCount = 0
    }

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

    // Get approved lesson notes and plans for this staff member
    const approvedNotes = await pool.query(
      "SELECT * FROM lessons WHERE staff_id = $1 AND type = 'lesson_note' AND status = 'approved' ORDER BY created_at DESC",
      [req.session.user.id]
    )

    const approvedPlans = await pool.query(
      "SELECT * FROM lessons WHERE staff_id = $1 AND type = 'lesson_plan' AND status = 'approved' ORDER BY created_at DESC",
      [req.session.user.id]
    )

    const notifications = await notificationModel.getUserNotifications(req.session.user.id, "staff")

    const announcements = await pool.query(
      `SELECT * FROM announcements
       WHERE COALESCE(LOWER(role_target), 'all') = 'all'
       ORDER BY created_at DESC`,
      []
    )

    res.render("dashboard/staff", {
      title: "Staff Dashboard",
      nav,
      currentPage: "staff",
      activeSection,
      user: { ...req.session.user, ...user },
      uploadedLessons: lessons.rows || [],
      approvedNotes: approvedNotes.rows || [],
      approvedPlans: approvedPlans.rows || [],
      notifications: notifications.rows.slice(0, 50) || [],
      announcements: announcements.rows || []
    })
  } catch (err) {
    console.error(err)
    res.render("dashboard/staff", {
      title: "Staff Dashboard",
      nav,
      currentPage: "staff",
      activeSection: "overview",
      user: req.session.user,
      uploadedLessons: [],
      approvedNotes: [],
      approvedPlans: [],
      notifications: [],
      announcements: []
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
    const activeSection = req.params.section || "overview"

    if (activeSection === "notifications") {
      await notificationModel.markAllUserNotificationsAsRead(studentId, "student")
      res.locals.notificationCount = 0
    }

    // Get student info
    const student = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [studentId]
    )

    // Get results
    const reportCards = await reportCardModel.getPublishedReportCardsForStudent(studentId)

    // Get approved lesson notes only
    const lessons = await pool.query(
      "SELECT * FROM lessons WHERE type = 'lesson_note' AND status = 'approved' ORDER BY created_at DESC"
    )

    const notifications = await notificationModel.getUserNotifications(studentId, "student")

    const announcements = await pool.query(
      `SELECT * FROM announcements
       WHERE COALESCE(LOWER(role_target), 'all') = 'all'
       ORDER BY created_at DESC`,
      []
    )

    res.render("dashboard/student", {
      title: "Student Dashboard",
      nav,
      currentPage: "student",
      activeSection,
      user: req.session.user,
      student: student.rows[0] || {},
      results: reportCards || [],
      reportCards,
      lessons: lessons.rows || [],
      notifications: notifications.rows || [],
      announcements: announcements.rows || []
    })
  } catch (err) {
    console.error(err)
    res.render("dashboard/student", {
      title: "Student Dashboard",
      nav,
      currentPage: "student",
      activeSection: req.params.section || "overview",
      user: req.session.user,
      student: {},
      results: [],
      lessons: [],
      notifications: [],
      announcements: []
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
    const activeSection = req.params.section || "overview"

    if (activeSection === "notifications") {
      await notificationModel.markAllUserNotificationsAsRead(parentId, "parent")
      res.locals.notificationCount = 0
    }

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
    const reportCards = await reportCardModel.getPublishedReportCardsForParent(parentId)

    const notifications = await notificationModel.getUserNotifications(parentId, "parent")

    const announcements = await pool.query(
      `SELECT * FROM announcements
       WHERE COALESCE(LOWER(role_target), 'all') = 'all'
       ORDER BY created_at DESC`,
      []
    )

    res.render("dashboard/parent", {
      title: "Parent Dashboard",
      nav,
      currentPage: "parent",
      activeSection,
      user: { ...req.session.user, ...user },
      children: children.rows || [],
      results: reportCards || [],
      reportCards,
      notifications: notifications.rows || [],
      announcements: announcements.rows || []
    })
  } catch (err) {
    console.error(err)
    res.render("dashboard/parent", {
      title: "Parent Dashboard",
      nav,
      user: req.session.user,
      children: [],
      results: [],
      notifications: [],
      announcements: []
    })
  }
};


// GET LIVE STATS
dashboardController.getStats = async (req, res) => {
  try {
    const students = await pool.query("SELECT COUNT(*) FROM users WHERE role='student'")
    const staff = await pool.query("SELECT COUNT(*) FROM users WHERE role='staff'")
    const classes = await pool.query("SELECT COUNT(*) FROM classes")

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