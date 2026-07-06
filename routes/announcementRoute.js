const express = require("express")
const router = express.Router()
const ctrl = require("../controllers/announcementController")

router.get("/", ctrl.getAll)
router.get("/:id", ctrl.getOne)
router.get("/api/latest", ctrl.getLatest)

module.exports = router