const notificationModel = require("../models/notificationModel")

/* =========================================
   GET NOTIFICATIONS (API)
========================================= */
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.session.user.id
    const role = req.session.user.role

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