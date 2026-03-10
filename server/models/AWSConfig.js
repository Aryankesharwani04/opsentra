const mongoose = require("mongoose");

const awsConfigSchema = new mongoose.Schema({
    accessKey: { type: String, required: true },
    secretKey: { type: String, required: true }, // stored as plain text
    region: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AWSConfig", awsConfigSchema);
