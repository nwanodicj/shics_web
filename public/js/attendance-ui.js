// attendance-ui.js

const now = new Date()
const hours = now.getHours()

if (hours < 7 || hours > 8) {
  document.getElementById("checkInBtn").disabled = true
}

if (hours < 15) {
  document.getElementById("checkOutBtn").disabled = true
}