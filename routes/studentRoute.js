const express = require("express")
const router = express.Router()
const studentController = require("../controllers/studentController")
const upload = require("../utilities/upload")

router.get("/dashboard", studentController.buildDashboard)

router.get("/download-report", studentController.downloadReport)

const { ensureAuth, checkRole } = require("../middleware/authMiddleware")

router.post(
  "/update-profile",
  ensureAuth,
  checkRole("student"),
  upload.single("profilePicture"),
  studentController.updateProfile
)

//router.get("/:id", studentController.getStudentProfile)

router.get(
  "/dashboard",
  ensureAuth,
  checkRole("student"),
  studentController.buildDashboard
)

module.exports = router