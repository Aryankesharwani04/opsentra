// controllers/newsletterController.js
const Subscriber = require("../models/Subscriber");
const User       = require("../models/User");

// Subscribe endpoint: handles both logged-in users and guest emails
exports.subscribe = async (req, res) => {
  try {
    // 1) figure out which email we’re dealing with
    let email = req.body.email;
    const isLoggedIn = req.user && req.user.id;

    if (isLoggedIn) {
      // for logged-in users, always use their account email
      const user = await User.findById(req.user.id).select("email newsletter");
      if (!user) return res.status(404).json({ msg: "User not found" });
      
      // if they’ve already subscribed via their account
      if (user.newsletter) {
        return res.status(400).json({ msg: "You are already subscribed." });
      }

      email = user.email;
    }

    // 2) validate we actually have an email
    if (!email) {
      return res.status(400).json({ msg: "Email is required" });
    }

    // 3) see if that email is already in the Subscriber collection
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: "Email is already subscribed" });
    }

    // 4) create the subscriber record
    await Subscriber.create({ email });

    // 5) if it was a logged-in user, flip their newsletter flag
    if (isLoggedIn) {
      await User.findByIdAndUpdate(req.user.id, { newsletter: true });
    }

    return res.status(201).json({ msg: "Subscribed successfully" });
  } catch (err) {
    // handle a unique-index violation (in case two requests raced)
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(400).json({ msg: "Email is already subscribed" });
    }
    console.error("Subscribe error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};


// Status endpoint: returns whether the current user is subscribed
exports.getStatus = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: "Authentication required" });
    }
    const user = await User.findById(req.user.id).select("newsletter");
    if (!user) return res.status(404).json({ msg: "User not found" });
    return res.json({ subscribed: Boolean(user.newsletter) });
  } catch (err) {
    console.error("Status error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};
