const express = require("express")
const router = express.Router()
const parentController = require("../controllers/parentController")
const { ensureAuth, checkRole } = require("../middleware/authMiddleware")
const upload = require("../utilities/upload")


router.get("/dashboard", parentController.buildDashboard)
router.get("/download-report/:studentId", parentController.downloadChildReport)
router.post(
  "/update-profile",
  ensureAuth,
  checkRole("parent"),
  upload.single("profilePicture"),
  parentController.updateProfile
)

router.get(
  "/dashboard",
  ensureAuth,
  checkRole("parent"),
  parentController.buildDashboard
)

router.get("/parents", (req, res) => {
  res.render("pages/parents", {
    title: "Parents & Guardians",
    currentPage: "parents"
  })
})

module.exports = router