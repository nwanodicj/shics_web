const bell = document.getElementById("notificationBell")
const dropdown = document.getElementById("notificationDropdown")
const countBadge = document.getElementById("notificationCount")

async function loadNotifications() {
  const res = await fetch("/notifications")
  const data = await res.json()

  dropdown.innerHTML = ""

  let unreadCount = 0

  data.forEach(n => {
    const div = document.createElement("div")
    div.className = "notification-item " + (!n.is_read ? "unread" : "")

    if (!n.is_read) unreadCount++

    div.innerHTML = `
      <p>${n.message}</p>
      <button onclick="markRead(${n.id})">✔</button>
      <button onclick="deleteNotif(${n.id})">🗑</button>
    `

    dropdown.appendChild(div)
  })

  countBadge.textContent = unreadCount
}

async function markRead(id) {
  await fetch(`/notifications/read/${id}`, { method: "POST" })
  loadNotifications()
}

async function deleteNotif(id) {
  await fetch(`/notifications/${id}`, { method: "DELETE" })
  loadNotifications()
}

bell.addEventListener("click", () => {
  dropdown.classList.toggle("hidden")
})

loadNotifications()