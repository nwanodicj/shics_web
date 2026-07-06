const express = require("express")
const router = express.Router()
const studentController = require("../controllers/studentController")

router.get("/dashboard", studentController.buildDashboard)

router.get("/download-report", studentController.downloadReport)

const { ensureAuth, checkRole } = require("../middleware/authMiddleware")

//router.get("/:id", studentController.getStudentProfile)

router.get(
  "/dashboard",
  ensureAuth,
  checkRole("student"),
  studentController.buildDashboard
)

module.exports = router