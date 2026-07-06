const express = require("express")
const router = express.Router()
const controller = require("../controllers/notificationController")

router.get("/", controller.getNotifications)
router.post("/read/:id", controller.markRead)
router.delete("/:id", controller.deleteNotification)
router.post("/send", controller.sendNotification)

module.exports = router