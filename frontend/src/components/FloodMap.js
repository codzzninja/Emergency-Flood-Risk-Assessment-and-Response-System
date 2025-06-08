import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { API_ENDPOINTS } from "../config/api"; // Import backend API endpoints configuration

function FloodMap() {
  // State to hold GeoJSON flood zone data to display on the map
  const [floodData, setFloodData] = useState(null);
  // State to track loading status of data fetching
  const [loading, setLoading] = useState(true);
  // State to capture any error messages during data fetching
  const [error, setError] = useState(null);

  useEffect(() => {
    // External ArcGIS API providing latest flood zone data
    const externalApiUrl =
      "https://opendata.arcgis.com/datasets/9c580a2d1e0f47a8a1d67170f82f23d2_0.geojson";
    // Backend endpoint for flood zones (to save and retrieve flood data)
    const backendFloodZonesUrl = API_ENDPOINTS.GIS.FLOOD_ZONES;

    const fetchAndSyncFloodData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch flood zone data from the external ArcGIS API
        console.log("Fetching data from external ArcGIS API...");
        const externalResponse = await fetch(externalApiUrl);

        if (!externalResponse.ok) {
          throw new Error(
            `Failed to fetch from external API: ${externalResponse.statusText}`
          );
        }

        const externalData = await externalResponse.json();
        console.log("Successfully fetched data from external API.");

        // 2. Attempt to POST the external flood data to backend for storage
        try {
          console.log("Sending data to backend...");
          const backendPostResponse = await fetch(backendFloodZonesUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(externalData),
          });

          if (!backendPostResponse.ok) {
            // Log error but do NOT throw; we want to still try to GET data from backend
            console.error(
              `Failed to POST to backend: ${backendPostResponse.statusText}`,
              await backendPostResponse.text()
            );
          } else {
            console.log("Successfully sent data to backend.");
          }
        } catch (postError) {
          // Handle network or other errors during POST
          console.error("Error POSTing data to backend:", postError);
          // Proceed to fetch from backend anyway
        }
      } catch (fetchExternalError) {
        // Handle errors fetching from external API (e.g. network down)
        console.error("Error fetching data from external API:", fetchExternalError);
        setError(
          `Failed to fetch primary flood data source. Displaying available data from server.`
        );
        // Continue to load data from backend as fallback
      } finally {
        // 3. Regardless of external fetch success, GET flood data from backend to display
        try {
          console.log("Fetching flood data from our backend...");
          const backendGetResponse = await fetch(backendFloodZonesUrl);

          if (!backendGetResponse.ok) {
            const errorText = await backendGetResponse.text();
            throw new Error(
              `Failed to fetch from backend: ${backendGetResponse.statusText} - ${errorText}`
            );
          }

          const backendData = await backendGetResponse.json();
          setFloodData(backendData);
          console.log("Successfully fetched flood data from our backend.");
        } catch (fetchBackendError) {
          // Handle errors fetching flood data from backend
          console.error("Error fetching flood data from our backend:", fetchBackendError);
          setError(
            error
              ? `${error} And also failed to load data from our server.`
              : `Failed to load flood data from our server: ${fetchBackendError.message}`
          );
          // Clear any flood data to avoid showing stale or invalid info
          setFloodData(null);
        }
        setLoading(false); // Finished all fetching attempts
      }
    };

    fetchAndSyncFloodData();
  }, []); // Empty dependency array means this runs only once when component mounts

  // Display loading message while fetching data
  if (loading) {
    return <div>Loading flood map data...</div>;
  }

  // If there was a critical error and no flood data at all, show error message
  if (error && !floodData) {
    return <div>Error: {error}</div>;
  }

  // If error occurred but we have some flood data, display data with a warning logged
  if (error && floodData) {
    console.warn(
      "Displaying potentially stale flood data due to errors during update:",
      error
    );
  }

  // Render the map with flood zones overlay
  return (
    <MapContainer center={[20, 0]} zoom={2} style={{ height: "100vh" }}>
      {/* Base map layer from OpenStreetMap */}
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Render flood zones as GeoJSON overlays */}
      {floodData && (
        <GeoJSON
          data={floodData}
          style={() => ({
            color: "blue", // Border color of flood zones
            weight: 1, // Border thickness
            fillOpacity: 0.3, // Transparency of fill
          })}
        />
      )}
    </MapContainer>
  );
}

export default FloodMap;
