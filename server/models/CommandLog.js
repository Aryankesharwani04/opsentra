const mongoose = require("mongoose");

const commandLogSchema = new mongoose.Schema({
  userId: String,
  command: String,
  output: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("CommandLog", commandLogSchema);
