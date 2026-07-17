const express = require("express")
const router = express.Router()
const staffController = require("../controllers/staffController")
const { ensureAuth, checkRole } = require("../middleware/authMiddleware")
const upload = require("../utilities/upload")


/* =========================
   UPLOAD LESSON
========================= */
router.post(
  "/upload-lesson",
  ensureAuth,
  checkRole("staff"),
  upload.single("file"), // 👈 multer middleware
  staffController.uploadLesson
)

router.post(
  "/update-profile",
  ensureAuth,
  checkRole("staff"),
  upload.single("profilePicture"),
  staffController.updateProfile
)

// Staff notification route
router.get("/notifications", staffController.getNotifications)
router.use(ensureAuth, checkRole("staff"))

module.exports = router