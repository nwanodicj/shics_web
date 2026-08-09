const pool = require("../database/connection")

let schemaReady = false

async function ensureSchema() {
  if (schemaReady) return

  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      title VARCHAR(180) NOT NULL,
      image_url TEXT,
      description TEXT NOT NULL,
      event_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_events_event_date
    ON events(event_date)
  `)

  schemaReady = true
}

async function createEvent({ title, imageUrl, description, eventDate }) {
  await ensureSchema()

  return pool.query(
    `INSERT INTO events (title, image_url, description, event_date)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, imageUrl || null, description, eventDate]
  )
}

async function getLatestUpcomingEvents(limit = 3) {
  await ensureSchema()

  const upcoming = await pool.query(
    `SELECT *
     FROM events
     WHERE event_date >= CURRENT_DATE
     ORDER BY event_date ASC, created_at DESC
     LIMIT $1`,
    [limit]
  )

  if (upcoming.rows.length > 0) {
    return upcoming
  }

  return pool.query(
    `SELECT *
     FROM events
     ORDER BY event_date DESC, created_at DESC
     LIMIT $1`,
    [limit]
  )
}

async function getAllEvents() {
  await ensureSchema()

  return pool.query(
    `SELECT *
     FROM events
     ORDER BY event_date ASC, created_at DESC`
  )
}

async function deleteEvent(eventId) {
  await ensureSchema()

  return pool.query(
    `DELETE FROM events
     WHERE id = $1`,
    [eventId]
  )
}

module.exports = {
  ensureSchema,
  createEvent,
  getLatestUpcomingEvents,
  getAllEvents,
  deleteEvent
}
