// AUTO-COMMENT: File Overview - routes/notificationRoute.js
// Purpose: Routing layer: endpoint definitions and middleware wiring.
const express = require("express")
const router = express.Router()
const controller = require("../controllers/notificationController")
const { ensureAuth } = require("../middleware/authMiddleware")

router.get("/", ensureAuth, controller.getNotifications)
router.post("/read/:id", ensureAuth, controller.markRead)
router.delete("/:id", ensureAuth, controller.deleteNotification)
router.post("/send", ensureAuth, controller.sendNotification)

module.exports = router