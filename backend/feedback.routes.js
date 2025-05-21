const express = require('express');
const router = express.Router();
const passport = require('passport');
const Feedback = require('./feedback.model');
const Game = require('./game.model');
const { check, validationResult } = require('express-validator');

// Auth middleware
const auth = passport.authenticate('jwt', { session: false });

// @route   GET /api/feedback/game/:gameId
// @desc    Get all feedback for a game
// @access  Public
router.get('/game/:gameId', async (req, res) => {
  try {
    const feedback = await Feedback.find({ gameId: req.params.gameId })
      .populate('userId', ['name', 'profilePicture'])
      .sort({ createdAt: -1 });
    
    res.json(feedback);
  } catch (err) {
    console.error('Error fetching feedback:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/feedback/user
// @desc    Get all feedback by current user
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const feedback = await Feedback.find({ userId: req.user.id })
      .populate('gameId', ['title', 'imageUrl', 'developer'])
      .sort({ createdAt: -1 });
    
    res.json(feedback);
  } catch (err) {
    console.error('Error fetching user feedback:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/feedback
// @desc    Create feedback for a game
// @access  Private
router.post('/', 
  [
    auth,
    check('gameId', 'Game ID is required').not().isEmpty(),
    check('rating', 'Rating is required').isInt({ min: 1, max: 10 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if game exists
      const game = await Game.findById(req.body.gameId);
      if (!game) {
        return res.status(404).json({ message: 'Game not found' });
      }
      
      // Check if user already submitted feedback for this game
      const existingFeedback = await Feedback.findOne({
        gameId: req.body.gameId,
        userId: req.user.id
      });
      
      if (existingFeedback) {
        return res.status(400).json({ message: 'You have already submitted feedback for this game' });
      }
      
      // Create new feedback
      const newFeedback = new Feedback({
        gameId: req.body.gameId,
        userId: req.user.id,
        rating: req.body.rating,
        review: req.body.review,
        platform: req.body.platform,
        playTime: req.body.playTime
      });
      
      await newFeedback.save();
      
      // Update game's user score (average of all ratings)
      const allFeedback = await Feedback.find({ gameId: req.body.gameId });
      const totalRating = allFeedback.reduce((sum, item) => sum + item.rating, 0);
      const averageRating = totalRating / allFeedback.length;
      
      game.userScore = averageRating;
      await game.save();
      
      res.status(201).json(newFeedback);
    } catch (err) {
      console.error('Error creating feedback:', err.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   PUT /api/feedback/:id
// @desc    Update feedback
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    // Check if user owns the feedback
    if (feedback.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Update fields
    if (req.body.rating) feedback.rating = req.body.rating;
    if (req.body.review) feedback.review = req.body.review;
    if (req.body.platform) feedback.platform = req.body.platform;
    if (req.body.playTime) feedback.playTime = req.body.playTime;
    
    await feedback.save();
    
    // Update game's user score
    const game = await Game.findById(feedback.gameId);
    const allFeedback = await Feedback.find({ gameId: feedback.gameId });
    const totalRating = allFeedback.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = totalRating / allFeedback.length;
    
    game.userScore = averageRating;
    await game.save();
    
    res.json(feedback);
  } catch (err) {
    console.error('Error updating feedback:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/feedback/:id
// @desc    Delete feedback
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    // Check if user owns the feedback or is admin
    if (feedback.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const gameId = feedback.gameId;
    
    await feedback.remove();
    
    // Update game's user score
    const game = await Game.findById(gameId);
    const allFeedback = await Feedback.find({ gameId });
    
    if (allFeedback.length > 0) {
      const totalRating = allFeedback.reduce((sum, item) => sum + item.rating, 0);
      const averageRating = totalRating / allFeedback.length;
      game.userScore = averageRating;
    } else {
      game.userScore = 0;
    }
    
    await game.save();
    
    res.json({ message: 'Feedback removed' });
  } catch (err) {
    console.error('Error deleting feedback:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
