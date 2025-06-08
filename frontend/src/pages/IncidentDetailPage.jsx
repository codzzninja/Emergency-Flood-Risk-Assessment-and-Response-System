import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import { 
  getIncidentById, 
  updateIncident, 
  addRescueStep, 
  updateRescueStep,
  getUsersByRole // Updated to use a proper user service function
} from '../services/incidentService';

// Basic styling (can be moved to a CSS file)
const styles = {
  container: { padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' },
  header: { marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' },
  detailSection: { marginBottom: '15px', padding: '10px', border: '1px solid #eee', borderRadius: '4px' },
  label: { fontWeight: 'bold', marginRight: '10px', display: 'block', marginBottom: '5px' },
  value: { marginBottom: '10px' },
  input: { width: 'calc(100% - 22px)', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '10px' },
  textarea: { width: 'calc(100% - 22px)', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '10px', minHeight: '80px' },
  select: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '10px' },
  button: { padding: '10px 15px', cursor: 'pointer', border: 'none', borderRadius: '4px', backgroundColor: '#007bff', color: 'white', marginRight: '10px' },
  saveButton: { backgroundColor: '#28a745' },
  error: { color: 'red', marginTop: '10px'},
  loading: { marginTop: '10px'},
  success: { color: 'green', marginTop: '10px'},
  rescueStep: { border: '1px dashed #ccc', padding: '10px', marginBottom: '10px', borderRadius: '4px' },
  rescueStepHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center'},
  rescueStepCompleted: { textDecoration: 'line-through', color: 'grey'},
  assignmentNotice: { backgroundColor: '#e7f3ff', padding: '10px', borderRadius: '4px', marginBottom: '10px', border: '1px solid #b3d9ff' }
};

const IncidentDetailPage = () => {
  const { id: incidentId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');

  const [incident, setIncident] = useState(null);
  const [editableIncident, setEditableIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [commandersLoading, setCommandersLoading] = useState(false);

  const [newStepInstruction, setNewStepInstruction] = useState('');
  const [commanders, setCommanders] = useState([]);

  useEffect(() => {
    if (user?.token) {
      try {
        const decoded = jwtDecode(user.token);
        setCurrentUserRole(decoded.role);
        setCurrentUserId(decoded.id || decoded.userId);
      } catch (e) {
        console.error("Failed to decode token:", e);
        setError("Invalid session.");
      }
    }
  }, [user]);

  // Fetch commanders when needed
  const fetchCommanders = useCallback(async () => {
    setCommandersLoading(true);
    try {
      // Replace with actual API call
      const response = await getUsersByRole('commander');
      setCommanders(response.data.users || []);
    } catch (err) {
      console.error("Failed to fetch commanders:", err);
      // Fallback to mock data for development
      setCommanders([
        { _id: "64a1b2c3d4e5f67890123456", username: 'Commander Alpha', email: 'alpha@rescue.com' },
        { _id: "64a1b2c3d4e5f67890123457", username: 'Commander Bravo', email: 'bravo@rescue.com' },
        { _id: "64a1b2c3d4e5f67890123458", username: 'Commander Charlie', email: 'charlie@rescue.com' }
      ]);
    } finally {
      setCommandersLoading(false);
    }
  }, []);

  const fetchIncidentDetails = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getIncidentById(incidentId);
      setIncident(response.data);
      setEditableIncident({ ...response.data });
    } catch (err) {
      setError('Failed to fetch incident details. ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  }, [incidentId]);

  useEffect(() => {
    fetchIncidentDetails();
  }, [fetchIncidentDetails]);

  // Fetch commanders only when user has permission and is editing
  useEffect(() => {
    if ((currentUserRole === 'official' || currentUserRole === 'coordinator') && isEditing) {
      fetchCommanders();
    }
  }, [currentUserRole, isEditing, fetchCommanders]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableIncident(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setEditableIncident(prev => ({
      ...prev,
      location: { ...prev.location, [name]: parseFloat(value) || 0 }
    }));
  };

  const handleCommanderAssignment = (e) => {
    const commanderId = e.target.value;
    setEditableIncident(prev => ({
      ...prev,
      assignedCommander: commanderId === "" ? null : commanderId
    }));
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    
    const { title, description, location, priority, status, assignedCommander, officialInstructions, teamNotes } = editableIncident;
    const updateData = { title, description, location, priority, status, officialInstructions, teamNotes };
    
    // Handle commander assignment/unassignment
    if (canAssignCommander) {
      updateData.assignedCommander = assignedCommander === "" || assignedCommander === null ? null : assignedCommander;
    }

    // Auto-update status when commander is assigned
    if (updateData.assignedCommander && incident.status === 'reported') {
      updateData.status = 'assigned';
    }

    try {
      const response = await updateIncident(incidentId, updateData);
      setIncident(response.data.incident);
      setEditableIncident({ ...response.data.incident });
      setIsEditing(false);
      setSuccess('Incident updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update incident. ' + (err.response?.data?.error || err.message));
    }
  };

  const handleAddRescueStep = async () => {
    if (!newStepInstruction.trim()) {
      setError('Rescue step instruction cannot be empty.');
      return;
    }
    setError('');
    try {
      const response = await addRescueStep(incidentId, { instruction: newStepInstruction });
      setIncident(response.data.incident);
      setEditableIncident({ ...response.data.incident });
      setNewStepInstruction('');
      setSuccess('Rescue step added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add rescue step. ' + (err.response?.data?.error || err.message));
    }
  };

  const handleToggleRescueStepComplete = async (stepNumber, currentStatus) => {
    setError('');
    try {
      const response = await updateRescueStep(incidentId, stepNumber, { isCompleted: !currentStatus });
      setIncident(response.data.incident);
      setEditableIncident({ ...response.data.incident });
      setSuccess(`Step ${stepNumber} marked as ${!currentStatus ? 'complete' : 'incomplete'}!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update rescue step. ' + (err.response?.data?.error || err.message));
    }
  };
  
  // Role-based permissions
  const canEditGeneral = currentUserRole === 'coordinator' || currentUserRole === 'official' || 
                        (currentUserRole === 'commander' && incident?.assignedCommander?._id === currentUserId);
  const canAssignCommander = currentUserRole === 'official' || currentUserRole === 'coordinator';
  const canEditOfficialInstructions = currentUserRole === 'official' || currentUserRole === 'coordinator';
  const canManageRescueSteps = currentUserRole === 'coordinator' || 
                              (currentUserRole === 'commander' && incident?.assignedCommander?._id === currentUserId);
  const canCompleteRescueSteps = currentUserRole === 'responder' || canManageRescueSteps;
  
  // Visibility permissions
  const canViewAssignmentSection = currentUserRole !== 'citizen';
  const canViewRescueSteps = currentUserRole !== 'citizen';
  const isAssignedCommander = currentUserRole === 'commander' && incident?.assignedCommander?._id === currentUserId;

  if (loading) return <p style={styles.loading}>Loading incident details...</p>;
  if (error && !incident) return <p style={styles.error}>{error}</p>;
  if (!incident) return <p>Incident not found.</p>;

  const displayIncident = isEditing ? editableIncident : incident;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Incident Details: {displayIncident.title}</h2>
        {canEditGeneral && !isEditing && <button style={styles.button} onClick={() => setIsEditing(true)}>Edit Incident</button>}
        {isEditing && (
          <>
            <button style={{...styles.button, ...styles.saveButton}} onClick={handleSave}>Save Changes</button>
            <button style={{...styles.button, backgroundColor: '#6c757d'}} onClick={() => { 
              setIsEditing(false); 
              setEditableIncident({...incident}); 
              setError(''); 
              setSuccess(''); 
            }}>Cancel</button>
          </>
        )}
      </div>
      
      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}

      {/* Assignment notification for commanders */}
      {isAssignedCommander && (
        <div style={styles.assignmentNotice}>
          <strong>📋 You are assigned as the commander for this incident.</strong>
        </div>
      )}

      <div style={styles.detailSection}>
        <h3>General Information</h3>
        <div><span style={styles.label}>Title:</span> 
          {isEditing && canEditGeneral ? 
            <input type="text" name="title" value={editableIncident.title || ''} onChange={handleInputChange} style={styles.input} /> : 
            <span style={styles.value}>{displayIncident.title}</span>}
        </div>
        <div><span style={styles.label}>Description:</span>
          {isEditing && canEditGeneral ? 
            <textarea name="description" value={editableIncident.description || ''} onChange={handleInputChange} style={styles.textarea} /> : 
            <p style={styles.value}>{displayIncident.description}</p>}
        </div>
        <div><span style={styles.label}>Priority:</span>
          {isEditing && canEditGeneral ? (
            <select name="priority" value={editableIncident.priority || 'medium'} onChange={handleInputChange} style={styles.select}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          ) : <span style={styles.value}>{displayIncident.priority?.toUpperCase()}</span>}
        </div>
        <div><span style={styles.label}>Status:</span>
          {isEditing && canEditGeneral ? (
            <select name="status" value={editableIncident.status || 'reported'} onChange={handleInputChange} style={styles.select}>
              <option value="reported">Reported</option>
              <option value="assigned">Assigned</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          ) : <span style={styles.value}>{displayIncident.status?.replace('-', ' ')?.toUpperCase()}</span>}
        </div>
        <div><span style={styles.label}>Reported By:</span> <span style={styles.value}>{displayIncident.reportedBy?.username || 'N/A'}</span></div>
        <div><span style={styles.label}>Reported At:</span> <span style={styles.value}>{new Date(displayIncident.timestamp).toLocaleString()}</span></div>
        <div><span style={styles.label}>Location:</span>
            Lat: {isEditing && canEditGeneral ? 
              <input type="number" step="any" name="lat" value={editableIncident.location?.lat || ''} onChange={handleLocationChange} style={{...styles.input, width: '100px', marginRight: '10px'}} /> : 
              <span style={styles.value}>{displayIncident.location?.lat}</span>}
            Lng: {isEditing && canEditGeneral ? 
              <input type="number" step="any" name="lng" value={editableIncident.location?.lng || ''} onChange={handleLocationChange} style={{...styles.input, width: '100px'}} /> : 
              <span style={styles.value}>{displayIncident.location?.lng}</span>}
        </div>
      </div>

      {canViewAssignmentSection && (
        <div style={styles.detailSection}>
          <h3>Assignment & Coordination</h3>
          <div><span style={styles.label}>Assigned Commander:</span>
            {isEditing && canAssignCommander ? (
              <select 
                name="assignedCommander" 
                value={editableIncident.assignedCommander?._id || editableIncident.assignedCommander || ""} 
                onChange={handleCommanderAssignment} 
                style={styles.select}
                disabled={commandersLoading}
              >
                <option value="">-- Select Commander --</option>
                {commanders.length > 0 ? commanders.map(commander => (
                  <option key={commander._id} value={commander._id}>
                    {commander.username} ({commander.email})
                  </option>
                )) : <option value="" disabled>{commandersLoading ? 'Loading commanders...' : 'No commanders available'}</option>}
              </select>
            ) : (
              <span style={styles.value}>
                {displayIncident.assignedCommander?.username || 'Not Assigned'}
                {displayIncident.assignedCommander?.email && ` (${displayIncident.assignedCommander.email})`}
              </span>
            )}
          </div>
          
          {(canEditOfficialInstructions || displayIncident.officialInstructions) && (
            <div><span style={styles.label}>Official Instructions:</span>
              {isEditing && canEditOfficialInstructions ? 
                <textarea name="officialInstructions" value={editableIncident.officialInstructions || ''} onChange={handleInputChange} style={styles.textarea} placeholder="Enter official instructions for this incident..." /> : 
                <p style={styles.value}>{displayIncident.officialInstructions || 'No official instructions provided'}</p>}
            </div>
          )}
          
          <div><span style={styles.label}>Team Notes:</span>
            {isEditing && canEditGeneral ? 
              <textarea name="teamNotes" value={editableIncident.teamNotes || ''} onChange={handleInputChange} style={styles.textarea} placeholder="Add team coordination notes..." /> : 
              <p style={styles.value}>{displayIncident.teamNotes || 'No team notes available'}</p>}
          </div>
        </div>
      )}

      {canViewRescueSteps && (
        <div style={styles.detailSection}>
          <h3>Rescue Steps</h3>
          {displayIncident.rescueSteps && displayIncident.rescueSteps.length > 0 ? (
            displayIncident.rescueSteps.sort((a,b) => a.stepNumber - b.stepNumber).map(step => (
              <div key={step.stepNumber} style={styles.rescueStep}>
                <div style={styles.rescueStepHeader}>
                  <strong style={step.isCompleted ? styles.rescueStepCompleted : {}}>
                    Step {step.stepNumber}: {step.instruction}
                  </strong>
                  {canCompleteRescueSteps && (
                      <button 
                          onClick={() => handleToggleRescueStepComplete(step.stepNumber, step.isCompleted)}
                          style={{
                            ...styles.button, 
                            padding: '5px 10px', 
                            backgroundColor: step.isCompleted ? '#ffc107' : '#17a2b8'
                          }}
                      >
                          {step.isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                      </button>
                  )}
                </div>
                {step.completedAt && (
                  <small style={{color: '#666', display: 'block', marginTop: '5px'}}>
                    Completed: {new Date(step.completedAt).toLocaleString()}
                  </small>
                )}
              </div>
            ))
          ) : (
            <p>No rescue steps defined yet.</p>
          )}
          
          {canManageRescueSteps && (
            <div style={{ marginTop: '15px' }}>
              <h4>Add New Rescue Step</h4>
              <textarea 
                value={newStepInstruction} 
                onChange={(e) => setNewStepInstruction(e.target.value)} 
                placeholder="Enter detailed instruction for the new rescue step..."
                style={{...styles.textarea, marginBottom: '5px'}}
              />
              <button onClick={handleAddRescueStep} style={{...styles.button, backgroundColor: '#17a2b8'}}>
                Add Step
              </button>
            </div>
          )}
        </div>
      )}

      <button onClick={() => navigate(-1)} style={{...styles.button, backgroundColor: '#6c757d', marginTop: '20px'}}>
        Back to Dashboard
      </button>
    </div>
  );
};

export default IncidentDetailPage;