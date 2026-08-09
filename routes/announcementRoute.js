const express = require("express")
const router = express.Router()
const ctrl = require("../controllers/announcementController")

router.get("/", ctrl.getAll)
router.get("/api/latest", ctrl.getLatest)
router.get("/:id", ctrl.getOne)

module.exports = router