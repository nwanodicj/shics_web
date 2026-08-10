// AUTO-COMMENT: File Overview - controllers/attendanceController.js
// Purpose: Controller layer: HTTP handlers and request/response orchestration.
const pool = require("../database/connection")
const attendanceModel = require("../models/attendanceModel")
const attendanceUtil = require("../utilities/attendanceUtil")
const notificationModel = require("../models/notificationModel")
const socketUtil = require("../utilities/socket")

async function notifyAdminAttendance(staffId, actionLabel) {
  const staffResult = await pool.query(
    "SELECT name FROM users WHERE id = $1",
    [staffId]
  )

  const staffName = staffResult.rows[0] ? staffResult.rows[0].name : `Staff ${staffId}`
  const message = `${staffName} has completed ${actionLabel}.`

  await notificationModel.createNotification({
    role_target: "admin",
    message
  })

  const io = socketUtil.getIO()
  io.to("admin").emit("notification", { message })
}

/* =========================================
   CHECK-IN
========================================= */
// Key logic: checkIn handler/function.
exports.checkIn = async (req, res) => {

  const { staffId } = req.body

  try {

    // ❌ Weekends blocked
    if (!attendanceUtil.isWeekday()) {
      return res.json({ success: false, message: "Check-in allowed only Mon–Fri" })
    }

    // ❌ Wrong time
    if (!attendanceUtil.isCheckInTime()) {
      return res.json({ success: false, message: "Check-in starts at 7:45 AM" })
    }

    await attendanceModel.createAttendance(staffId, "Check-In")
    await notifyAdminAttendance(staffId, "check-in")

    return res.json({ success: true, message: "Checked in successfully" })

  } catch (err) {
    console.error(err)
    res.json({ success: false, message: "Check-in failed" })
  }
}


/* =========================================
   CHECK-OUT
========================================= */
// Key logic: checkOut handler/function.
exports.checkOut = async (req, res) => {

  const { staffId } = req.body

  try {

    if (!attendanceUtil.isWeekday()) {
      return res.json({ success: false, message: "Check-out allowed only Mon–Fri" })
    }

    if (!attendanceUtil.isCheckOutTime()) {
      return res.json({ success: false, message: "Check-out starts at 3:00 PM" })
    }

    await attendanceModel.createAttendance(staffId, "Check-Out")
    await notifyAdminAttendance(staffId, "check-out")

    return res.json({ success: true, message: "Checked out successfully" })

  } catch (err) {
    console.error(err)
    res.json({ success: false, message: "Check-out failed" })
  }
}

// Key logic: getAttendance handler/function.
exports.getAttendance = async (req, res) => {
  try {
    const selectedDate = req.query.date || new Date().toISOString().split("T")[0]

    const result = await pool.query(
      `SELECT staff_id, action, date, time
       FROM attendance
       WHERE date = $1
       ORDER BY time DESC`,
      [selectedDate]
    )

    const records = result.rows.map((row) => ({
      staff_name: row.staff_id ? `Staff ${row.staff_id}` : "Unknown staff",
      action: row.action,
      date: row.date,
      time: row.time
    }))

    return res.json(records)
  } catch (err) {
    console.error(err)
    return res.status(500).json([])
  }
}