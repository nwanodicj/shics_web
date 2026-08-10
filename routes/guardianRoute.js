// AUTO-COMMENT: File Overview - routes/guardianRoute.js
// Purpose: Routing layer: endpoint definitions and middleware wiring.
const express = require("express")
const router = express.Router()
const guardianController = require("../controllers/guardianController")

// ✅ THIS MUST MATCH CONTROLLER NAME
router.get("/", guardianController.getGuardianDashboard)

module.exports = router