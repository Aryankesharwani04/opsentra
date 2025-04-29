const mongoose = require("mongoose");

const SubscriberSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  subscribedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Subscriber", SubscriberSchema);
