console.log('games.routes.js loaded');
const express = require('express');
const router = express.Router();
const passport = require('passport');
const Game = require('./game.model');
const kaggleService = require('./kaggle.service');
const { check, validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const axios = require('axios'); // Import axios

// Auth middleware
const auth = passport.authenticate('jwt', { session: false });

// Admin middleware
const admin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

let isImporting = false; // Flag to prevent concurrent imports

async function importFromVgSalesCsv() {
  if (isImporting) {
    throw new Error('An import process is already running.');
  }
  isImporting = true;

  try {
    const results = [];
    const csvFilePath = path.join(__dirname, '..', 'datasets', 'vgsales.csv');
    console.log(`Attempting to import from CSV: ${csvFilePath}`);

    if (!fs.existsSync(csvFilePath)) {
      console.error(`CSV file not found at: ${csvFilePath}`);
      throw new Error(`CSV file not found at: ${csvFilePath}`);
    }

    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    if (results.length === 0) {
      console.log('No data found in vgsales.csv.');
      return { message: 'No data to import from vgsales.csv.', importedCount: 0 };
    }

    console.log(`Processing ${results.length} records from vgsales.csv.`);
    
    // Optimization: Fetch existing game identifiers once
    console.log('Fetching existing game identifiers for de-duplication...');
    const existingGamesQuery = await Game.find({}, { title: 1, platforms: 1 });
    const existingGameSet = new Set();
    for (const game of existingGamesQuery) {
        // Assuming platforms is an array, and we care about the first platform for vgsales uniqueness for now
        // or that vgsales.csv platform field matches one of the items in the platforms array.
        // A more complex de-duplication might be needed if a game title can exist across multiple platforms distinctly in your model.
        if (game.platforms && game.platforms.length > 0) {
            // Create a unique key for each platform the game exists on
            game.platforms.forEach(p => existingGameSet.add(`${game.title.toLowerCase().trim()}-${p.toLowerCase().trim()}`));
        } else {
             existingGameSet.add(`${game.title.toLowerCase().trim()}-undefinedplatform`); // Handle cases with no platform
        }
    }
    console.log(`Found ${existingGameSet.size} unique existing game-platform combinations.`);

    const gameOperations = [];
    let skippedCount = 0;
    for (const record of results) {
      const title = record.Name || record.title;
      if (!title) {
        skippedCount++;
        continue; 
      }

      const platform = record.Platform ? record.Platform.trim() : 'undefinedplatform';
      const uniqueKey = `${title.toLowerCase().trim()}-${platform.toLowerCase().trim()}`;

      if (existingGameSet.has(uniqueKey)) {
        // Try to update imageUrl for existing games missing it
        const existingGame = await Game.findOne({ title: title, platforms: platform });
        if (existingGame && !existingGame.imageUrl) {
          try {
            const searchUrl = `https://api.rawg.io/api/games?search=${encodeURIComponent(title)}&key=${process.env.RAWG_API_KEY}&page_size=1`;
            const rawgResponse = await axios.get(searchUrl);
            if (rawgResponse.data?.results?.[0]?.background_image) {
              existingGame.imageUrl = rawgResponse.data.results[0].background_image;
              await existingGame.save();
              console.log(`Updated image for ${title}: ${existingGame.imageUrl}`);
            }
          } catch (error) {
            console.log(`Couldn't fetch image for ${title}:`, error.message);
          }
        }
        skippedCount++;
        continue;
      }

      // First try to get the image URL from RAWG
      let imageUrl = null;
      try {
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const searchUrl = `https://api.rawg.io/api/games?search=${encodeURIComponent(title)}&key=${process.env.RAWG_API_KEY}&page_size=1`;
        const rawgResponse = await axios.get(searchUrl);
        if (rawgResponse.data?.results?.[0]?.background_image) {
          imageUrl = rawgResponse.data.results[0].background_image;
          console.log(`Found image for ${title}: ${imageUrl}`);
        }
      } catch (error) {
        console.log(`Couldn't fetch image for ${title}:`, error.message);
      }

      const gameDoc = {
        title: title,
        developer: record.Developer || 'N/A',
        publisher: record.Publisher || 'N/A',
        releaseDate: record.Year ? new Date(parseInt(record.Year), 0, 1) : new Date(0),
        genres: record.Genre ? [record.Genre.trim()] : [],
        platforms: record.Platform ? [record.Platform.trim()] : [],
        imageUrl: imageUrl, // Add the image URL
        naSales: parseFloat(record.NA_Sales) || 0,
        euSales: parseFloat(record.EU_Sales) || 0,
        jpSales: parseFloat(record.JP_Sales) || 0,
        otherSales: parseFloat(record.Other_Sales) || 0,
        globalSales: parseFloat(record.Global_Sales) || 0,
      };
      gameOperations.push({ insertOne: { document: gameDoc } });
      // Add to set after deciding to insert to prevent re-inserting from CSV if CSV has duplicates
      existingGameSet.add(uniqueKey); 
    }
    console.log(`Skipped ${skippedCount} records (no title or already exists).`);

    if (gameOperations.length === 0) {
        console.log('No new games to import after processing and de-duplication.');
        return { message: 'No new games to import from vgsales.csv.', importedCount: 0, skippedCount };
    }

    console.log(`Attempting to bulkWrite ${gameOperations.length} new games...`);
    const bulkWriteResult = await Game.bulkWrite(gameOperations, { ordered: false });
    const importedCount = bulkWriteResult.insertedCount || 0;
    console.log(`${importedCount} new games imported successfully into MongoDB from vgsales.csv.`);
    return { message: `${importedCount} new games imported from vgsales.csv.`, importedCount, skippedCount };

  } finally {
    isImporting = false;
  }
}

// @route   GET /api/games
// @desc    Get all games with pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const games = await Game.find()
      .sort({ releaseDate: -1 })
      .skip(skip)
      .limit(limit)
      .select('title developer publisher releaseDate genres platforms imageUrl userScore');
    
    const total = await Game.countDocuments();
    
    res.json({
      games,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error fetching games:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/games/csv - Serve Kaggle CSV data as JSON
router.get('/csv', async (req, res) => {
  console.log('HIT /api/games/csv endpoint');
  const results = [];
  const csvPath = path.join(__dirname, '..', 'datasets', 'vgsales.csv');
  fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      res.json(results);
    })
    .on('error', (err) => {
      console.error('Error reading CSV from /api/games/csv:', err.message);
      res.status(500).json({ message: 'Error reading CSV', error: err.message });
    });
});

// @route   GET /api/games/kaggle/search
// @desc    Search Kaggle for gaming datasets
// @access  Private (Admin)
router.get('/kaggle/search', [auth, admin], async (req, res) => {
  try {
    const query = req.query.query || 'video games';
    const limit = parseInt(req.query.limit) || 10;
    
    const datasets = await kaggleService.searchDatasets(query, limit);
    
    res.json(datasets);
  } catch (err) {
    console.error('Error searching Kaggle datasets:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/games/kaggle/import
// @desc    Import games from Kaggle dataset
// @access  Private (Admin)
router.post('/kaggle/import', [auth, admin], async (req, res) => {
  try {
    const { owner, dataset } = req.body;
    
    if (!owner || !dataset) {
      return res.status(400).json({ message: 'Owner and dataset are required' });
    }
    
    const downloadPath = './tmp/kaggle';
    await kaggleService.downloadDataset(owner, dataset, downloadPath);
    const filePath = `${downloadPath}/${dataset}.csv`;
    const gamesData = await kaggleService.parseGamingDataset(filePath);
    
    const savedGames = [];
    for (const game of gamesData) {
      const existingGame = await Game.findOne({ title: game.title });
      if (!existingGame) {
        const newGame = new Game(game);
        await newGame.save();
        savedGames.push(newGame);
      }
    }
    res.json({
      message: `Imported ${savedGames.length} games from Kaggle dataset`,
      games: savedGames
    });
  } catch (err) {
    console.error('Error importing Kaggle dataset:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/games/by-title/:title
// @desc    Get game by title (slug or exact)
// @access  Public
router.get('/by-title/:title', async (req, res) => {
  try {
    const titleSlug = req.params.title.toLowerCase();
    
    // Try to find by exact title match first
    let game = await Game.findOne({ 
      title: { $regex: new RegExp(`^${titleSlug.replace(/-/g, '[ -]')}$`, 'i') }
    });
    
    // If not found, try a more flexible search
    if (!game) {
      // Convert slug format (e.g., "game-title") to a regex that can match "Game Title" or "game title"
      const searchRegex = new RegExp(titleSlug.replace(/-/g, '[ -]'), 'i');
      game = await Game.findOne({ title: searchRegex });
    }
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found by title' });
    }
    
    res.json(game);
  } catch (err) {
    console.error('Error fetching game by title:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/games/:id
// @desc    Get game by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    // Check if the ID is a valid MongoDB ObjectId
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      const game = await Game.findById(req.params.id);
      if (game) {
        return res.json(game);
      }
    }
    
    // If not a valid ObjectId or game not found by ID, try to find by title/slug
    // This allows URLs like /games/game-title to work
    const titleSlug = req.params.id.toLowerCase();
    
    // Try to find by exact title match first
    let game = await Game.findOne({ 
      title: { $regex: new RegExp(`^${titleSlug.replace(/-/g, '[ -]')}$`, 'i') }
    });
    
    // If not found, try a more flexible search
    if (!game) {
      // Convert slug format (e.g., "game-title") to a regex that can match "Game Title" or "game title"
      const searchRegex = new RegExp(titleSlug.replace(/-/g, '[ -]'), 'i');
      game = await Game.findOne({ title: searchRegex });
    }
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    res.json(game);
  } catch (err) {
    console.error('Error fetching game by ID or title:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Game not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete game
// @access  Private (Admin)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const game = await Game.findByIdAndDelete(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    res.json({ message: 'Game removed' });
  } catch (err) {
    console.error('Error deleting game:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Game not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// New route to trigger import from vgsales.csv
router.post('/import-vgsales', async (req, res) => {
  console.log('Received request to /api/games/import-vgsales');
  try {
    // Optional: Add admin-only protection here
    // if (!req.user || req.user.role !== 'admin') {
    //   return res.status(403).json({ message: 'Access denied. Admin only.' });
    // }
    const result = await importFromVgSalesCsv();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error during vgsales.csv import route:", error.message);
    res.status(500).json({ message: 'Failed to import games from vgsales.csv', error: error.message });
  }
});

// New route to fetch game image from RAWG.io
router.get('/image-search', async (req, res) => {
  const { title } = req.query;
  if (!title) {
    return res.status(400).json({ message: 'Game title is required' });
  }

  try {
    // First try to find the game in our database
    const game = await Game.findOne({ title: new RegExp(title, 'i') });
    
    if (game && game.imageUrl) {
      return res.json({ imageUrl: game.imageUrl });
    }

    // If we don't have an image, search RAWG
    const apiKey = process.env.RAWG_API_KEY;
    if (!apiKey) {
      console.error('RAWG API key not found in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    
    const searchUrl = `https://api.rawg.io/api/games?search=${encodeURIComponent(title)}&key=${apiKey}&page_size=1`;
    
    console.log(`Searching RAWG for: ${title}`);
    const rawgResponse = await axios.get(searchUrl);
    
    if (rawgResponse.data && rawgResponse.data.results && rawgResponse.data.results.length > 0) {
      const gameData = rawgResponse.data.results[0];
      const imageUrl = gameData.background_image;
      if (imageUrl) {
        console.log(`Found image for ${title}: ${imageUrl}`);
        
        // Update the game in our database with the new image URL
        await Game.findOneAndUpdate(
          { title: new RegExp(title, 'i') },
          { imageUrl: imageUrl },
          { new: true }
        );
        
        return res.json({ imageUrl });
      } else {
        console.log(`No image_url found for ${title} in RAWG response.`);
        return res.status(404).json({ message: 'Image not found in RAWG response' });
      }
    } else {
      console.log(`No results for ${title} from RAWG.`);
      return res.status(404).json({ message: 'Game not found on RAWG.io' });
    }
  } catch (error) {
    console.error('Error fetching game image from RAWG.io:', error.response ? error.response.data : error.message);
    // Check for RAWG API specific errors if necessary
    if (error.response && error.response.status === 401) {
        return res.status(401).json({ message: 'RAWG API authentication failed. Check API Key.' });
    }
    if (error.response && error.response.status === 404) {
        return res.status(404).json({ message: 'Game not found on RAWG.io (API 404)' });
    }
    res.status(500).json({ message: 'Server error while fetching game image' });
  }
});

// Make sure this is at the end
module.exports = router;
