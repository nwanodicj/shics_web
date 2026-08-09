const express = require("express")
const router = express.Router()
const adminController = require("../controllers/adminController")
const upload = require("../utilities/upload")
const { ensureAuth, checkRole } = require("../middleware/authMiddleware")

router.use(ensureAuth, checkRole("admin"))

/* =========================
   ADMIN DASHBOARD PAGES
========================= */
router.get("/dashboard", adminController.dashboard)
router.get("/students", adminController.getStudents)
router.get("/staff", adminController.getStaff)
router.get("/gallery", adminController.getGallery)
router.get("/parents", adminController.getParents)
router.get("/lessons", adminController.getLessonPlans)
router.get("/announcements", adminController.getAnnouncements)
router.get("/events", adminController.getEvents)
router.get("/notifications", adminController.getNotificationsPage)
router.get("/results", adminController.getResults)
router.get("/reports", adminController.getReports)
router.get("/analytics", adminController.getAnalytics)

/* =========================
   ADMIN ACTIONS
========================= */
router.post("/add-student", adminController.addStudent)
router.post("/add-staff", adminController.addStaff)
router.post("/add-gallery-image", upload.single("image"), adminController.addGalleryImage)
router.post("/link-parent", adminController.linkParentStudent)
router.post("/add-result", adminController.addResult)
router.post("/publish-results", adminController.publishResults)
router.post("/create-announcement", adminController.createAnnouncement)
router.post("/create-event", upload.single("event_image"), adminController.createEvent)
router.post("/update-lesson-status", adminController.updateLessonStatus)
router.get("/delete-student/:id", adminController.deleteStudent)
router.get("/delete-staff/:id", adminController.deleteStaff)
router.get("/delete-gallery-image/:id", adminController.deleteGalleryImage)
router.get("/delete-event/:id", adminController.deleteEvent)

module.exports = router
