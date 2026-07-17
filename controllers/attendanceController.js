const pool = require("../database/connection")
const attendanceModel = require("../models/attendanceModel")
const attendanceUtil = require("../utilities/attendanceUtil")

/* =========================================
   CHECK-IN
========================================= */
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

    return res.json({ success: true, message: "Checked in successfully" })

  } catch (err) {
    console.error(err)
    res.json({ success: false, message: "Check-in failed" })
  }
}


/* =========================================
   CHECK-OUT
========================================= */
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

    return res.json({ success: true, message: "Checked out successfully" })

  } catch (err) {
    console.error(err)
    res.json({ success: false, message: "Check-out failed" })
  }
}

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