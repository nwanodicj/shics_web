// AUTO-COMMENT: File Overview - routes/eventRoute.js
// Purpose: Routing layer: endpoint definitions and middleware wiring.
const express = require("express")
const router = express.Router()
const eventController = require("../controllers/eventController")

router.get("/api/latest", eventController.getLatest)

module.exports = router
