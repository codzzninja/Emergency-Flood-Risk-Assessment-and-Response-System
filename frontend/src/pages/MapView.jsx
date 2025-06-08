import React, { useEffect, useState, useContext } from 'react'; 
import { AuthContext } from '../context/AuthContext'; 
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import { getFloodZones } from '../services/floodService';
import { getIncidents } from '../services/incidentService';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet (necessary because Leaflet's default icon URLs are not bundled)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapView = () => {
  // Extract user and authentication loading state from AuthContext
  const { user, authLoading } = useContext(AuthContext);

  // State to hold fetched flood zones GeoJSON data
  const [zones, setZones] = useState(null);

  // State to hold fetched incidents data
  const [incidents, setIncidents] = useState([]);

  // State to track loading status of map data (zones and incidents)
  const [mapDataLoading, setMapDataLoading] = useState(true);

  // State to store any errors that occur while fetching map data
  const [error, setError] = useState('');

  useEffect(() => {
    // Async function to fetch flood zones and incidents data
    const fetchData = async () => {
      // Wait until authentication loading finishes before fetching data
      if (authLoading) return;

      // If user is not logged in, show error and clear map data
      if (!user) {
        setError("Please log in to view map data.");
        setMapDataLoading(false);
        setIncidents([]);
        setZones(null);
        return;
      }

      // Begin loading map data
      setMapDataLoading(true);
      setError('');
      try {
        // Fetch flood zones and incidents concurrently
        const [zonesRes, incidentsRes] = await Promise.all([
          getFloodZones(),
          getIncidents({ page: 1, limit: 1000, sortBy: 'timestamp', order: 'desc' })
        ]);
        
        // Set state with fetched data
        setZones(zonesRes.data);
        setIncidents(incidentsRes.data?.incidents || []);
      } catch (err) {
        // Log and display error if fetch fails
        console.error('Error fetching map data:', err);
        setError('Failed to fetch map data. ' + (err.response?.data?.error || err.message));
        setIncidents([]); // Clear incidents on error
      } finally {
        setMapDataLoading(false);
      }
    };

    // Call the fetch function when authLoading or user changes
    fetchData();
  }, [authLoading, user]);

  // Define style for each flood zone polygon based on its risk property
  const getZoneStyle = (feature) => {
    const risk = feature.properties.risk;
    let color = '#3388ff'; // Default color (blue)

    // Assign colors based on risk levels
    switch (risk) {
      case 'High':
        color = '#ff0000'; // Red for high risk
        break;
      case 'Medium':
        color = '#ff8800'; // Orange for medium risk
        break;
      case 'Low':
        color = '#ffff00'; // Yellow for low risk
        break;
      default:
        color = '#3388ff'; // Default blue
    }

    // Return Leaflet style object for polygons
    return {
      fillColor: color,
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.4
    };
  };

  // Render loading, error, or authentication status messages before rendering the map
  if (authLoading) {
    return <div className="p-4">Authenticating...</div>;
  }

  if (mapDataLoading) {
    return <div className="p-4">Loading map data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }
  
  if (!user && !authLoading) {
    return <div className="p-4">Please log in to view the map.</div>;
  }

  // Render the Leaflet map with flood zones and incident markers
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Flood Risk Map</h2>

      {/* MapContainer from react-leaflet sets up the map */}
      <MapContainer
        center={[22.5726, 88.3639]} // Default center coordinates (e.g., Kolkata)
        zoom={13} // Initial zoom level
        style={{ height: '600px', width: '100%' }} // Map size styling
      >
        {/* TileLayer to load map tiles from OpenStreetMap */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Render flood zones as GeoJSON polygons with styles and popups */}
        {zones && (
          <GeoJSON
            data={zones}
            style={getZoneStyle}
            onEachFeature={(feature, layer) => {
              if (feature.properties) {
                // Bind popup with zone name, risk level, and description
                layer.bindPopup(`
                  <strong>${feature.properties.name}</strong><br/>
                  Risk Level: ${feature.properties.risk}<br/>
                  ${feature.properties.description}
                `);
              }
            }}
          />
        )}
        
        {/* Render incident markers with popups showing details */}
        {Array.isArray(incidents) && incidents.map((incident, idx) => (
          <Marker
            key={incident._id || idx}
            position={[incident.location.lat, incident.location.lng]}
          >
            <Popup>
              <strong>{incident.title}</strong><br />
              {incident.description}<br />
              <em>Reported by: {incident.reportedBy?.username || 'Unknown'}</em><br />
              <small>{new Date(incident.timestamp).toLocaleString()}</small>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
