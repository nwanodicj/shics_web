// AFTER admin approves lesson
const io = socketUtil.getIO()

const notificationModel = require("../models/notificationModel")
const socketUtil = require("../utilities/socket")

// Save to DB
await notificationModel.createNotification({
  user_id: staffId,
  message: "Your lesson plan was approved"
})

// Send real-time
io.to(`user_${staffId}`).emit("notification", {
  message: "Your lesson plan was approved"
})