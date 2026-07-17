const express = require("express")
const router = express.Router()
const adminController = require("../controllers/adminController")
const { ensureAuth, checkRole } = require("../middleware/authMiddleware")

/* =========================
   STUDENT MANAGEMENT
========================= */



// Add student
router.post("/add-student", adminController.addStudent)

// Link parent
router.post("/link-parent", adminController.linkParentStudent)

// Analytics
router.get("/analytics", ensureAuth, checkRole("admin"), adminController.getAnalytics)

// Add student result
router.post("/add-result", adminController.addResult)

// Delete student
router.get("/delete-student/:id", adminController.deleteStudent)

/* =========================
   VIEW LESSON PLANS
========================= */
router.get(
  "/dashboard",
  ensureAuth,
  checkRole("admin"),
  adminController.getLessonPlans,
)


/* =========================
   APPROVE / REJECT LESSON
========================= */
router.post("/update-lesson-status", adminController.updateLessonStatus)

module.exports = router