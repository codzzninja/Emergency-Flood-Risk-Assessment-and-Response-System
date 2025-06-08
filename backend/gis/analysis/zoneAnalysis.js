const turf = require('@turf/turf'); // Import Turf.js for spatial analysis

/**
 * Analyzes the risk level of a given geographic point based on defined risk zones.
 * 
 * @param {Object} point - The geographic point to analyze. Expected format: { lat: Number, lng: Number }
 * @param {Object} zones - A GeoJSON FeatureCollection containing polygon features with `risk` in their properties.
 * 
 * @returns {String} - The risk level as a string (e.g., 'High', 'Medium', 'Low'), or 'None' if not in any zone.
 */
exports.analyzeRisk = (point, zones) => {
  // Convert the input point (lat, lng) into a Turf.js point geometry
  const pt = turf.point([point.lng, point.lat]); // Note: [lng, lat] order as per GeoJSON spec

  // Search for the first zone that contains this point using Turf's booleanPointInPolygon
  const riskZone = zones.features.find(zone => turf.booleanPointInPolygon(pt, zone));

  // If a matching zone is found, return its 'risk' property; otherwise, return 'None'
  return riskZone ? riskZone.properties.risk : 'None';
};
