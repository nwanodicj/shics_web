
const pool = require("../database/connection")
exports.getGuardianDashboard = async (req, res) => {
  try {
    const user = req.session.user

    // fallback for testing (VERY IMPORTANT)
    const parentId = user?.id || 1

    // ✅ CHILDREN
    const children = await pool.query(`
      SELECT u.id, u.name
      FROM users u
      JOIN parent_student ps ON ps.student_id = u.id
      WHERE ps.parent_id = $1
    `, [parentId])

    // ✅ NOTIFICATIONS
    const notifications = await pool.query(`
      SELECT message
      FROM notifications
      WHERE user_id = $1 OR role_target = 'parent'
      ORDER BY created_at DESC
      LIMIT 5
    `, [parentId])

    res.render("pages/guardian", {
      title: "Guardian Dashboard",
      currentPage: "guardians",
      user,
      children: children.rows,
      notifications: notifications.rows
    })

  } catch (err) {
    console.error(err)
    res.send("Guardian dashboard error")
  }
}