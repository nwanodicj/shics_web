// AUTO-COMMENT: File Overview - database/connection.js
// Purpose: Database artifact: schema, setup, or SQL operations.
/**
 * PostgreSQL Connection (CommonJS)
 */

require("dotenv").config()
const { Pool } = require("pg")

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000
}

if (process.env.NODE_ENV === "production" || /render\.com/.test(process.env.DATABASE_URL || "")) {
  poolConfig.ssl = {
    rejectUnauthorized: false
  }
}

const pool = new Pool(poolConfig)

pool.on("error", (err) => {
  console.error("Unexpected idle PostgreSQL client error:", err)
})

module.exports = pool