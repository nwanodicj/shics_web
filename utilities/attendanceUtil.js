/* =========================================
   ATTENDANCE TIME VALIDATOR
   - Ensures correct check-in/out time
   - Ensures weekdays only
========================================= */

function isWeekday() {
  const day = new Date().getDay()
  return day >= 1 && day <= 5 // Monday–Friday
}

function isCheckInTime() {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()

  return hours === 7 && minutes >= 45 // 7:45 AM+
}

function isCheckOutTime() {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()

  return hours === 15 && minutes >= 0 // 3:00 PM+
}

module.exports = {
  isWeekday,
  isCheckInTime,
  isCheckOutTime
}