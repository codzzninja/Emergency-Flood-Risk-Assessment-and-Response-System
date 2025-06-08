const fs = require('fs');
const path = require('path');

// Controller function to get flood zone data from a local GeoJSON file
exports.getFloodZones = (req, res) => {
  // Construct the absolute path to the flood_zones.geojson file
  const dataPath = path.join(__dirname, '../gis/data/flood_zones.geojson');

  // Read the GeoJSON file asynchronously
  fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) {
      // If the file is not found, return a 404 response with a message
      if (err.code === 'ENOENT') {
        return res.status(404).json({ message: 'Flood zones data file not found.' });
      }

      // For other errors (e.g., permissions), return a 500 internal server error
      console.error('Failed to read flood data in floodController:', err);
      return res.status(500).json({ error: 'Could not read flood data' });
    }

    // If the file is empty or only contains whitespace, return an empty GeoJSON structure
    if (!data || data.trim() === '') {
      console.warn('flood_zones.geojson is empty in floodController.');
      return res.status(200).json({ type: "FeatureCollection", features: [] }); // Return a valid empty GeoJSON object
    }

    try {
      // Attempt to parse the file content as JSON
      const jsonData = JSON.parse(data);

      // Respond with the parsed GeoJSON data
      res.json(jsonData);
    } catch (parseErr) {
      // If parsing fails, log the error and respond with a 500 status and message
      console.error('Failed to parse flood_zones.geojson in floodController:', parseErr);
      return res.status(500).json({ error: 'Flood data is corrupted or not valid JSON.' });
    }
  });
};
