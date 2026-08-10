// AUTO-COMMENT: File Overview - models/guardianModel.js
// Purpose: Data layer: persistence and data access logic.
const pool = require("../database/connection") // your pg pool

// Get children for a guardian through the parent_student relationship
// Key logic: getChildrenByGuardian handler/function.
exports.getChildrenByGuardian = async (guardianId) => {
    const result = await pool.query(`
        SELECT u.id, u.name, u.role
        FROM users u
        JOIN parent_student ps ON ps.student_id = u.id
        WHERE ps.parent_id = $1
    `, [guardianId])

    return result.rows
}

// Get notifications for a guardian, using the standard notifications schema
// Key logic: getNotifications handler/function.
exports.getNotifications = async (guardianId) => {
    const result = await pool.query(`
        SELECT message
        FROM notifications
        WHERE user_id = $1 OR role_target = 'parent'
        ORDER BY created_at DESC
        LIMIT 5
    `, [guardianId])

    return result.rows
}