/* =========================================
   SOCKET.IO GLOBAL ACCESS UTILITY
========================================= */

let ioInstance

function init(server) {
  const { Server } = require("socket.io")

  ioInstance = new Server(server)

  ioInstance.on("connection", (socket) => {

    console.log("User connected:", socket.id)

    // Join rooms (user + role)
    socket.on("joinRoom", (room) => {
      socket.join(room)
    })
  })

  return ioInstance
}

function getIO() {
  if (!ioInstance) {
    throw new Error("Socket.io not initialized")
  }
  return ioInstance
}

module.exports = {
  init,
  getIO
}