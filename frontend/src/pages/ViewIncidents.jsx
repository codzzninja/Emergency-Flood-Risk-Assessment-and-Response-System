import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Import auth context to get user info and loading state
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'; // React-Leaflet components for map rendering
import { getIncidents } from '../services/incidentService'; // Service to fetch incident data
import L from 'leaflet';

// Fix for default leaflet marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ViewIncidents = () => {
  // Access authenticated user and loading state from AuthContext
  const { user, authLoading } = useContext(AuthContext);

  // State to hold incidents fetched from the server
  const [incidents, setIncidents] = useState([]);
  // State to manage loading status of data fetching
  const [loading, setLoading] = useState(true);
  // State to capture any error messages during fetch
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchIncidents = async () => {
      // Wait for auth check to complete
      if (authLoading) return;

      // If user is not logged in, set error and clear data
      if (!user) {
        setError("Please log in to view incidents.");
        setLoading(false);
        setIncidents([]);
        return;
      }

      setLoading(true);
      setError('');
      try {
        // Fetch incidents with pagination and sorting options
        const response = await getIncidents({
          page: 1,
          limit: 1000,
          sortBy: 'timestamp',
          order: 'desc',
        });
        // Update incidents state with data or empty array
        setIncidents(response.data?.incidents || []);
      } catch (err) {
        // Log error and update error state for user feedback
        console.error('Error fetching incidents:', err);
        setError('Failed to fetch incidents. ' + (err.response?.data?.error || err.message));
        setIncidents([]);
      } finally {
        setLoading(false);
      }
    };

    // Fetch incidents on component mount or when auth state changes
    fetchIncidents();
  }, [authLoading, user]);

  // Show authenticating message while auth status is loading
  if (authLoading) return <div className="p-4">Authenticating...</div>;
  // Show loading message while incidents are being fetched
  if (loading) return <div className="p-4">Loading incidents...</div>;
  // Show error message if any error occurred during fetch
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  // If no user logged in, prompt to login to view the map
  if (!user) return <div className="p-4">Please log in to view the map.</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Reported Incidents</h2>
      <MapContainer
        center={[22.5726, 88.3639]} // Default center coordinates (e.g., Kolkata)
        zoom={6} // Zoom level for map
        style={{ height: '600px', width: '100%' }} // Set map container dimensions
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // OpenStreetMap tile server
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Map markers for each incident */}
        {Array.isArray(incidents) && incidents.map((incident, idx) => (
          <Marker
            key={incident._id || idx} // Use incident id or index as key
            position={[incident.location.lat, incident.location.lng]} // Marker position from incident location
          >
            <Popup>
              <strong>{incident.title}</strong><br />
              {incident.description}<br />
              <em>Reported by: {incident.reportedBy?.username || 'Unknown'}</em><br />
              <small>{new Date(incident.timestamp).toLocaleString()}</small> {/* Format timestamp */}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ViewIncidents;
