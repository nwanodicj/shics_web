/* =========================================
   DATABASE CONNECTION
========================================= */
const pool = require("../database/connection")

/* =========================================
   CREATE NOTIFICATION
========================================= */
async function createNotification({ user_id, role_target, message }) {
  return db.query(
    `INSERT INTO notifications (user_id, role_target, message)
     VALUES ($1, $2, $3)`,
    [user_id || null, role_target || null, message]
  )
}

/* =========================================
   GET USER NOTIFICATIONS
========================================= */
async function getUserNotifications(userId, role) {
  return db.query(
    `SELECT * FROM notifications
     WHERE user_id = $1 OR role_target = $2
     ORDER BY created_at DESC`,
    [userId, role]
  )
}

/* =========================================
   MARK AS READ
========================================= */
async function markAsRead(notificationId) {
  return db.query(
    `UPDATE notifications
     SET is_read = TRUE
     WHERE id = $1`,
    [notificationId]
  )
}

/* =========================================
   DELETE NOTIFICATION
========================================= */
async function deleteNotification(notificationId) {
  return db.query(
    `DELETE FROM notifications WHERE id = $1`,
    [notificationId]
  )
}

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  deleteNotification
}