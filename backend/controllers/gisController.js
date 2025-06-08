const fs = require('fs');
const path = require('path');
const { analyzeRisk } = require('../gis/analysis/zoneAnalysis');

// ----------------------------
// Check if a given location (lat, lng) falls into a flood risk zone
// ----------------------------
exports.checkLocationRisk = (req, res) => {
  const { lat, lng } = req.query;

  // Path to the flood zone GeoJSON data file
  const dataPath = path.join(__dirname, '../gis/data/flood_zones.geojson');

  // Read the GeoJSON data from disk
  fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Could not load GIS data' });
    }

    // Parse the flood zone data and analyze the location for risk
    const zones = JSON.parse(data);
    const risk = analyzeRisk({ lat, lng }, zones);

    // Return the risk assessment result
    res.json({ risk });
  });
};

// ----------------------------
// Path to the flood zones GeoJSON file (used by multiple functions)
// ----------------------------
const floodZonesDataPath = path.join(__dirname, '../gis/data/flood_zones.geojson');

// ----------------------------
// Update flood zones data from client-provided GeoJSON
// ----------------------------
exports.updateFloodZones = (req, res) => {
  const newFloodData = req.body; // Assumes body-parser middleware (like express.json()) is used

  // Validate request body
  if (!newFloodData || Object.keys(newFloodData).length === 0) {
    return res.status(400).json({ error: 'No GeoJSON data provided in the request body.' });
  }

  // Write the new GeoJSON data to file
  fs.writeFile(
    floodZonesDataPath,
    JSON.stringify(newFloodData, null, 2), // Pretty print with 2-space indentation
    'utf8',
    (err) => {
      if (err) {
        console.error('Failed to write flood zones data:', err);
        return res.status(500).json({ error: 'Could not update flood zones data.' });
      }

      // Success response
      res.status(200).json({ message: 'Flood zones data updated successfully.' });
    }
  );
};

// ----------------------------
// Get and return flood zones GeoJSON data
// ----------------------------
exports.getFloodZones = (req, res) => {
  // Read the flood zones data file
  fs.readFile(floodZonesDataPath, 'utf8', (err, data) => {
    if (err) {
      // If the file does not exist, return 404 with a clear message
      if (err.code === 'ENOENT') {
        return res.status(404).json({
          message: 'Flood zones data not found. Please upload data first.'
        });
      }

      // Other file read errors
      console.error('Failed to read flood zones data:', err);
      return res.status(500).json({ error: 'Could not load flood zones data.' });
    }

    try {
      // Parse and return the valid GeoJSON data
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseErr) {
      // If JSON is malformed, return a parsing error
      console.error('Failed to parse flood zones data:', parseErr);
      return res.status(500).json({ error: 'Flood zones data is corrupted.' });
    }
  });
};
