const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
const { requireLogin, requireRole } = require("../utilities/authMiddleware");


/* =========================================
   DASHBOARD ROUTES (PROTECTED)
========================================= */

// Admin
router.get("/admin",
  requireLogin,
  requireRole("admin"),
  dashboardController.admin
);

// Staff
router.get("/staff",
  requireLogin,
  requireRole("staff"),
  dashboardController.staff
);

// Student
router.get("/student",
  requireLogin,
  requireRole("student"),
  dashboardController.student
);

// Parent
router.get("/parent",
  requireLogin,
  requireRole("parent"),
  dashboardController.parent
);

router.get("/stats", dashboardController.getStats)

module.exports = router;