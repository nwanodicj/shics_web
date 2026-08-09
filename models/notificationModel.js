/* =========================================
   DATABASE CONNECTION
========================================= */
const pool = require("../database/connection")

/* =========================================
   CREATE NOTIFICATION
========================================= */
async function createNotification({ user_id, role_target, message }) {
  return pool.query(
    `INSERT INTO notifications (user_id, role_target, message)
     VALUES ($1, $2, $3)`,
    [user_id || null, role_target || null, message]
  )
}

/* =========================================
   GET USER NOTIFICATIONS
========================================= */
async function getUserNotifications(userId, role) {
  return pool.query(
    `SELECT * FROM notifications
     WHERE user_id = $1
       OR (
         user_id IS NULL
         AND (
           role_target = $2
           OR role_target = 'all'
           OR role_target IS NULL
         )
       )
     ORDER BY created_at DESC`,
    [userId, role]
  )
}

/* =========================================
   GET UNREAD NOTIFICATION COUNT
========================================= */
async function getUnreadNotificationCount(userId, role) {
  return pool.query(
    `SELECT COUNT(*)::int AS count
     FROM notifications
     WHERE (
       user_id = $1
       OR (
         user_id IS NULL
         AND (
           role_target = $2
           OR role_target = 'all'
           OR role_target IS NULL
         )
       )
     )
       AND COALESCE(is_read, FALSE) = FALSE`,
    [userId, role]
  )
}

/* =========================================
   MARK AS READ
========================================= */
async function markAsRead(notificationId) {
  return pool.query(
    `UPDATE notifications
     SET is_read = TRUE
     WHERE id = $1`,
    [notificationId]
  )
}

/* =========================================
   MARK ALL USER NOTIFICATIONS AS READ
========================================= */
async function markAllUserNotificationsAsRead(userId, role) {
  return pool.query(
    `UPDATE notifications
     SET is_read = TRUE
     WHERE (
       user_id = $1
       OR (
         user_id IS NULL
         AND (
           role_target = $2
           OR role_target = 'all'
           OR role_target IS NULL
         )
       )
     )
       AND COALESCE(is_read, FALSE) = FALSE`,
    [userId, role]
  )
}

/* =========================================
   DELETE NOTIFICATION
========================================= */
async function deleteNotification(notificationId) {
  return pool.query(
    `DELETE FROM notifications WHERE id = $1`,
    [notificationId]
  )
}

module.exports = {
  createNotification,
  getUserNotifications,
  getUnreadNotificationCount,
  markAsRead,
  markAllUserNotificationsAsRead,
  deleteNotification
}