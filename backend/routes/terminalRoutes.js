const express = require("express");
const router = express.Router();
const CommandLog = require("../models/CommandLog");

// Get ALL logs
router.get("/logs", async (req, res) => {
  try {
    const logs = await CommandLog.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "❌ Error fetching logs", error });
  }
});

// Get ONE log by ID
router.get("/logs/:id", async (req, res) => {
  try {
    const log = await CommandLog.findById(req.params.id);
    res.json(log);
  } catch (error) {
    res.status(404).json({ message: "❌ Log not found", error });
  }
});

module.exports = router;