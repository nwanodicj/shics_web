const express = require("express")
const router = express.Router()
const eventController = require("../controllers/eventController")

router.get("/api/latest", eventController.getLatest)

module.exports = router
