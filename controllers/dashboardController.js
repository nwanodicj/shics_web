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

  res.render("dashboard/staff", {
    title: "Staff Dashboard",
    nav,
    user: req.session.user
  });
};

/* ===============================
   STUDENT DASHBOARD
================================ */
dashboardController.student = async function (req, res) {
  let nav = await utilities.getNav();

  res.render("dashboard/student", {
    title: "Student Dashboard",
    nav,
    user: req.session.user
  });
};

/* ===============================
   PARENT DASHBOARD
================================ */
dashboardController.parent = async function (req, res) {
  let nav = await utilities.getNav();

  res.render("dashboard/parent", {
    title: "Parent Dashboard",
    nav,
    user: req.session.user
  });
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