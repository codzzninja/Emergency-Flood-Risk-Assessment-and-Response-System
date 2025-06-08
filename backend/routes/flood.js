const express = require('express');
const fs = require('fs');
const https = require('https');
const router = express.Router();

const floodController = require('../controllers/floodController');

// Route 1: GET /zones
// Delegates request to floodController.getFloodZones to read and return flood zones GeoJSON data
router.get('/zones', floodController.getFloodZones);

// Route 2: GET /download-flood-data
// Downloads flood zone data from an external URL and saves it locally on the backend
router.get('/download-flood-data', async (req, res) => {
  // URL of the external GeoJSON flood zones data
  const url = 'https://opendata.arcgis.com/datasets/9c580a2d1e0f47a8a1d67170f82f23d2_0.geojson';
  // Local file path to save the downloaded flood zones data
  const filePath = './gis/data/flood_zones.geojson';

  // Send HTTPS GET request to the URL
  https.get(url, (response) => {
    // Create a writable stream to the local file
    const fileStream = fs.createWriteStream(filePath);
    // Pipe the response data to the file stream
    response.pipe(fileStream);

    // On finishing writing to the file
    fileStream.on('finish', () => {
      fileStream.close(); // Close the file stream
      // Respond with success message
      res.json({ message: 'Flood data saved successfully' });
    });
  }).on('error', (err) => {
    // Handle any errors during download
    console.error('Error downloading file:', err);
    res.status(500).json({ error: 'Failed to download flood data' });
  });
});

// Export the router to be used in the main Express app
module.exports = router;
