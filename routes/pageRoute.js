const express = require("express")
const router = express.Router()
const pageController = require("../controllers/pageController")

router.get("/", pageController.getHome)
router.get("/about", pageController.getAbout)
router.get("/guardians", pageController.getGuardians)
router.get("/admission", pageController.getAdmission)
router.get("/contact", pageController.getContact)
router.get("/creche", pageController.getCreche)
router.get("/pre-nursery", pageController.getPreNursery)
router.get("/prep", pageController.getPrep)
router.get("/nursery", pageController.getNursery)
router.get("/pre-prep", pageController.getPrePrep)
router.get("/secondary", pageController.getSecondary)
router.get("/primary", pageController.getPrimary)

module.exports = router