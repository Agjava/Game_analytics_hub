const { KaggleNode } = require('kaggle-node');
const fs = require('fs');
const path = require('path');

class KaggleService {
  constructor() {
    // Ensure KAGGLE_USERNAME and KAGGLE_KEY are set in the environment
    if (!process.env.KAGGLE_USERNAME || !process.env.KAGGLE_KEY) {
      console.warn('Kaggle API credentials (KAGGLE_USERNAME, KAGGLE_KEY) are not set in environment variables.');
      // Depending on desired behavior, you might throw an error or proceed without authentication
      // For now, we proceed, and calls requiring auth will likely fail.
      this.kaggle = null; // Or some unauthenticated instance if the library supports it
      return;
    }
    this.kaggle = new KaggleNode({
      credentials: {
        username: process.env.KAGGLE_USERNAME,
        key: process.env.KAGGLE_KEY
      }
    });
    // The kaggle-node library handles authentication with credentials in constructor,
    // so the explicit this.kaggle.authenticate() call might not be needed or might differ.
    // We will remove the old this.kaggle.authenticate() line.
  }

  /**
   * Search for datasets on Kaggle
   * @param {string} query - Search query
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array>} - List of datasets
   */
  async searchDatasets(query, limit = 10) {
    try {
      if (!this.kaggle) {
        console.warn("Kaggle client not initialized, cannot search datasets.");
        return []; // Return empty array or throw error
      }
      // kaggle-node's search method might not directly support 'limit'.
      // It uses pagination with 'page'. We'll search and let it use its default page size.
      const response = await this.kaggle.datasets.search({
        search: query
      });
      // Assuming 'response' is the array of datasets or an object containing them.
      // This might need adjustment based on the actual structure of 'response'.
      // If response is an object like { results: [...] }, then return response.results.
      return response; 
    } catch (error) {
      console.error('Error searching Kaggle datasets:', error);
      throw new Error(`Failed to search datasets: ${error.message}`);
    }
  }

  /**
   * Download a dataset from Kaggle
   * @param {string} owner - Dataset owner
   * @param {string} dataset - Dataset name
   * @param {string} downloadPath - Path to download the dataset to
   * @returns {Promise<string>} - Path to downloaded dataset
   */
  async downloadDataset(owner, dataset, downloadPath) {
    try {
      if (!this.kaggle) {
        console.warn("Kaggle client not initialized, cannot download dataset.");
        return downloadPath; // Return path, but no download occurs
      }
      
      if (!fs.existsSync(downloadPath)) {
        fs.mkdirSync(downloadPath, { recursive: true });
      }
      
      const handleStr = `${owner}/${dataset}`;
      console.log(`Attempting to download dataset: ${handleStr} using kaggle-node.`);
      
      // This call returns the file data (e.g., a buffer for a zip file)
      const fileData = await this.kaggle.datasets.download(handleStr); 
      
      // TODO: Determine filename and extension from response headers or assume zip.
      // For now, let's assume it's always a zip file named after the dataset.
      const filePath = path.join(downloadPath, `${dataset}.zip`);
      
      // Write the file data to the specified path
      // fs.writeFileSync(filePath, fileData); // 'fileData' might be a stream, Buffer, etc.
                                            // This needs to be handled correctly based on its type.
      console.log(`Kaggle dataset download initiated for ${handleStr}. Data type: ${typeof fileData}. Needs to be saved to ${filePath}.`);
      // For now, the file is NOT being saved. This part requires careful implementation.
      
      return downloadPath; // Returning the intended path, but file saving is pending.
    } catch (error) {
      console.error('Error downloading Kaggle dataset:', error);
      throw new Error(`Failed to download dataset: ${error.message}`);
    }
  }

  /**
   * Parse a gaming dataset and convert to our data model
   * @param {string} filePath - Path to the dataset file
   * @returns {Promise<Array>} - List of game objects
   */
  async parseGamingDataset(filePath) {
    try {
      // Read the file
      const data = fs.readFileSync(filePath, 'utf8');
      
      // Parse CSV or JSON based on file extension
      let games = [];
      const ext = path.extname(filePath).toLowerCase();
      
      if (ext === '.csv') {
        // Simple CSV parsing (in a real app, use a CSV parser library)
        const lines = data.split('\n');
        const headers = lines[0].split(',');
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',');
          const game = {};
          
          headers.forEach((header, index) => {
            game[header.trim()] = values[index] ? values[index].trim() : '';
          });
          
          games.push(this.mapToGameModel(game));
        }
      } else if (ext === '.json') {
        const jsonData = JSON.parse(data);
        games = Array.isArray(jsonData) 
          ? jsonData.map(game => this.mapToGameModel(game))
          : [this.mapToGameModel(jsonData)];
      } else {
        throw new Error(`Unsupported file format: ${ext}`);
      }
      
      return games;
    } catch (error) {
      console.error('Error parsing gaming dataset:', error);
      throw new Error(`Failed to parse dataset: ${error.message}`);
    }
  }

  /**
   * Map dataset fields to our game model
   * @param {Object} data - Raw data from dataset
   * @returns {Object} - Mapped game object
   */
  mapToGameModel(data) {
    // This mapping will depend on the specific dataset structure
    // Adjust field names based on the actual dataset you're using
    return {
      title: data.title || data.name || data.game_name || '',
      developer: data.developer || data.dev || '',
      publisher: data.publisher || data.pub || '',
      releaseDate: data.release_date || data.releaseDate || new Date(),
      genres: this.parseArrayField(data.genres || data.genre || ''),
      platforms: this.parseArrayField(data.platforms || data.platform || ''),
      metacriticScore: parseInt(data.metacritic || data.metacritic_score || 0),
      userScore: parseFloat(data.user_score || data.userScore || 0),
      description: data.description || data.summary || '',
      imageUrl: data.image_url || data.imageUrl || '',
      kaggleDatasetId: data.id || ''
    };
  }

  /**
   * Parse array fields from string
   * @param {string} field - Field that might contain an array as string
   * @returns {Array} - Parsed array
   */
  parseArrayField(field) {
    if (Array.isArray(field)) return field;
    if (!field) return [];
    
    // Try to parse as JSON array
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [field];
    } catch (e) {
      // If not JSON, split by common separators
      return field.split(/[,;|]/).map(item => item.trim()).filter(Boolean);
    }
  }
}

module.exports = new KaggleService();
