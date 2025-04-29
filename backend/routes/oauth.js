const router = require('express').Router();
const passport = require('passport');
// Google
router.get('/auth/google', passport.authenticate('google', { scope: ['profile','email'] }));
router.get('/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    // issue JWT, redirect to frontend with token
    res.redirect(`http://localhost:5173/dashboard?token=${req.user.token}`);
  }
);
// GitHub
router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/auth/github/callback',
  passport.authenticate('github', { session: false }),
  (req, res) => {
    res.redirect(`http://localhost:5173/dashboard?token=${req.user.token}`);
  }
);
module.exports = router;
