const eventModel = require("../models/eventModel")

exports.getLatest = async (req, res) => {
  try {
    const result = await eventModel.getLatestUpcomingEvents(3)
    res.json(result.rows)
  } catch (err) {
    console.error("Event latest query failed:", err)
    res.status(500).json({ error: "Unable to load latest events" })
  }
}
