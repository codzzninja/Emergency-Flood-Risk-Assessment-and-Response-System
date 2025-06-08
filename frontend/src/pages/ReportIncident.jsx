import React, { useState } from 'react';
import { reportIncident } from '../services/incidentService';

const ReportIncident = () => {
  // State to hold form inputs: title, description, latitude, longitude, reportedBy
  const [form, setForm] = useState({
    title: '',
    description: '',
    lat: '',
    lng: '',
    reportedBy: ''
  });

  // State to indicate if the form submission is in progress
  const [loading, setLoading] = useState(false);

  // State to hold success or error message after submission
  const [message, setMessage] = useState('');

  // Update form state on input field changes
  const handleChange = (e) => 
    setForm({ ...form, [e.target.name]: e.target.value });

  // Handle form submission asynchronously
  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent default form submission behavior
    setLoading(true);   // set loading state to true to disable submit button
    setMessage('');     // clear any previous messages

    try {
      // Call API service to report incident
      // Convert lat and lng strings to floats for location object
      await reportIncident({
        ...form,
        location: { lat: parseFloat(form.lat), lng: parseFloat(form.lng) }
      });

      // On success, display success message and reset form fields
      setMessage('Incident reported successfully!');
      setForm({ title: '', description: '', lat: '', lng: '', reportedBy: '' });
    } catch (err) {
      // On error, display the error message (from response or generic)
      setMessage('Failed to report incident: ' + (err.response?.data?.error || err.message));
    } finally {
      // Reset loading state regardless of success or failure
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        {/* Form title */}
        <h2 className="text-xl font-bold mb-4">Report Incident</h2>
        
        {/* Incident title input */}
        <input
          name="title"
          placeholder="Incident Title"
          value={form.title}
          onChange={handleChange}
          required
          className="block w-full mb-3 p-2 border rounded"
        />
        
        {/* Description textarea */}
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
          className="block w-full mb-3 p-2 border rounded h-24"
        />
        
        {/* Latitude input (number type) */}
        <input
          name="lat"
          type="number"
          step="any" // allow decimal input
          placeholder="Latitude"
          value={form.lat}
          onChange={handleChange}
          required
          className="block w-full mb-3 p-2 border rounded"
        />
        
        {/* Longitude input (number type) */}
        <input
          name="lng"
          type="number"
          step="any"
          placeholder="Longitude"
          value={form.lng}
          onChange={handleChange}
          required
          className="block w-full mb-3 p-2 border rounded"
        />
        
        {/* Reported By input */}
        <input
          name="reportedBy"
          placeholder="Reported By"
          value={form.reportedBy}
          onChange={handleChange}
          required
          className="block w-full mb-3 p-2 border rounded"
        />
        
        {/* Submit button, disabled when loading */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Report Incident'}
        </button>
        
        {/* Message display area, green text on success, red on failure */}
        {message && (
          <p className={`mt-3 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default ReportIncident;
