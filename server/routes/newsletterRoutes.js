const express = require("express");
const { subscribe, getStatus } = require("../controllers/newsletterController");
const auth = require("../middleware/auth");

const router = express.Router();

// Public or authenticated subscribe endpoint
router.post("/subscribe", auth.optional, subscribe);

// Get current user's subscription status (protected route)
router.get("/status", auth.required, getStatus);

module.exports = router;
