const express = require("express")
const router = express.Router()
const parentController = require("../controllers/parentController")
const { ensureAuth, checkRole } = require("../middleware/authMiddleware")


router.get("/dashboard", parentController.buildDashboard)
router.get("/download-report/:studentId", parentController.downloadChildReport)

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