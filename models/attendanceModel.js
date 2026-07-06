const pool = require("../database/")

/* =========================================
   CREATE ATTENDANCE RECORD
========================================= */
async function createAttendance(staffId, action) {

  const now = new Date()

  const date = now.toISOString().split("T")[0]
  const time = now.toTimeString().split(" ")[0]

  const sql = `
    INSERT INTO attendance (staff_id, action, date, time)
    VALUES ($1, $2, $3, $4)
  `

  await pool.query(sql, [staffId, action, date, time])
}

module.exports = {
  createAttendance
}