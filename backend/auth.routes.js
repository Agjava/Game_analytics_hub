const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('./user.model');

// @route   GET /api/auth/google
// @desc    Authenticate with Google
// @access  Public
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @route   GET /api/auth/google/callback
// @desc    Google auth callback
// @access  Public
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    console.log('Google OAuth callback - Authentication successful');
    
    // Create JWT token
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth-callback?token=${token}`);
  }
);

// @route   GET /api/auth/github
// @desc    Authenticate with GitHub
// @access  Public
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// @route   GET /api/auth/github/callback
// @desc    GitHub auth callback
// @access  Public
router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // Create JWT token
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth-callback?token=${token}`);
  }
);

// @route   GET /api/auth/user
// @desc    Get current user
// @access  Private
router.get(
  '/user',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-__v');
      res.json(user);
    } catch (err) {
      console.error('Error fetching user:', err.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   GET /api/auth/logout
// @desc    Logout user / clear cookie
// @access  Public
router.get('/logout', (req, res) => {
  // Nothing to do server-side with JWT auth
  // Client should remove the token
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
