/**
 * Account Model
 */

const pool = require("../database/connection")

/* ================================
   REGISTER USER
================================ */
async function registerUser(name, email, password, role = "student") {
  try {
    const sql = `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `

    const result = await pool.query(sql, [
      name,
      email,
      password,
      role
    ])

    return result.rows[0]

  } catch (error) {
    console.error("Register User Error:", error)
    return null
  }
}

/* ================================
   GET USER BY EMAIL
================================ */
async function getUserByEmail(email) {
  try {
    const sql = `SELECT * FROM users WHERE email = $1`
    const result = await pool.query(sql, [email])
    return result.rows[0]

  } catch (error) {
    console.error("Get User Error:", error)
    return null
  }
}

module.exports = {
  registerUser,
  getUserByEmail
}