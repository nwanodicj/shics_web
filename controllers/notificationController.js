// AUTO-COMMENT: File Overview - controllers/notificationController.js
// Purpose: Controller layer: HTTP handlers and request/response orchestration.
const notificationModel = require("../models/notificationModel")

/* =========================================
   GET NOTIFICATIONS (API)
========================================= */
// Key logic: getNotifications handler/function.
exports.getNotifications = async (req, res) => {
  try {
    const user = req.session?.user

    if (!user?.id) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    const userId = user.id
    const role = user.role

    const result = await notificationModel.getUserNotifications(userId, role)

    res.json(result.rows)

  } catch (err) {
    console.error(err)
    res.status(500).send("Error loading notifications")
  }
}

/* =========================================
   MARK AS READ
========================================= */
// Key logic: markRead handler/function.
exports.markRead = async (req, res) => {
  try {
    const id = req.params.id

    await notificationModel.markAsRead(id)

    res.sendStatus(200)

  } catch (err) {
    console.error(err)
    res.status(500).send("Error updating notification")
  }
}

/* =========================================
   DELETE NOTIFICATION
========================================= */
// Key logic: deleteNotification handler/function.
exports.deleteNotification = async (req, res) => {
  try {
    const id = req.params.id

    await notificationModel.deleteNotification(id)

    res.sendStatus(200)

  } catch (err) {
    console.error(err)
    res.status(500).send("Error deleting notification")
  }
}

// Key logic: sendNotification handler/function.
exports.sendNotification = (req, res) => {
  const io = req.app.get("io")

  const { message } = req.body

  if (!message) {
    return res.status(400).send("Message required")
  }

  // Emit to ALL users (can later target roles)
  io.emit("new_notification", {
    message,
    time: new Date()
  })

  res.send("Notification sent")
}