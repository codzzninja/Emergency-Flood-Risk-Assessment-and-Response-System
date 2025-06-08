import React, { useContext, useEffect, useState, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getIncidents, deleteIncident } from '../services/incidentService';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, Title, BarElement, CategoryScale, LinearScale);

// Updated styling using CSS variables and modern look
const styles = {
  container: {
    padding: '20px',
    fontFamily: 'var(--font-family-sans-serif)',
    backgroundColor: 'var(--background-color)',
  },
  header: {
    marginBottom: '30px',
    paddingBottom: '15px',
    borderBottom: '1px solid var(--border-color)',
    color: 'var(--dark-color)',
  },
  headerTitle: {
    fontSize: '2rem',
    fontWeight: '500',
  },
  chartsSection: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '20px',
  },
  chartContainer: {
    flex: '1 1 300px',
    maxWidth: '400px',
    height: '350px',
    padding: '20px',
    backgroundColor: 'var(--card-bg)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    boxShadow: 'var(--shadow)',
  },
  filterSection: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    flexWrap: 'wrap',
    backgroundColor: 'var(--card-bg)',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: 'var(--shadow)',
    marginBottom: '30px',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    fontSize: '0.95rem',
    flexGrow: 1,
  },
  select: {
    padding: '10px 12px',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    fontSize: '0.95rem',
    backgroundColor: 'var(--card-bg)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    boxShadow: 'var(--shadow)',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  th: {
    borderBottom: '2px solid var(--primary-color)',
    padding: '12px 15px',
    textAlign: 'left',
    backgroundColor: 'var(--light-color)',
    color: 'var(--dark-color)',
    fontWeight: '500',
    textTransform: 'uppercase',
    fontSize: '0.85rem',
  },
  td: {
    borderBottom: '1px solid var(--border-color)',
    padding: '12px 15px',
    color: 'var(--text-color)',
  },
  actionButton: {
    padding: '8px 15px',
    marginRight: '8px',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'background-color 0.2s ease',
  },
  dangerButton: {
    backgroundColor: 'var(--danger-color)',
    color: 'white',
  },
  viewLink: {
    textDecoration: 'none',
    color: 'var(--info-color)',
    fontWeight: '500',
  },
  error: {
    color: 'var(--danger-color)',
    marginTop: '10px',
    padding: '10px',
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    border: '1px solid var(--danger-color)',
    borderRadius: '4px',
  },
  loading: {
    marginTop: '10px',
    color: 'var(--secondary-color)',
    fontSize: '1.1rem',
  },
  paginationContainer: {
    marginTop: '30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: 'var(--card-bg)',
    borderRadius: '8px',
    boxShadow: 'var(--shadow)',
  },
  noIncidentsMessage: {
    textAlign: 'center',
    marginTop: '30px',
    padding: '20px',
    backgroundColor: 'var(--card-bg)',
    borderRadius: '8px',
    boxShadow: 'var(--shadow)',
    color: 'var(--secondary-color)',
    fontSize: '1.1rem',
  }
};

const Dashboard = () => {
  const { user, authLoading } = useContext(AuthContext);
  const [role, setRole] = useState('');
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: '',
    priority: '',
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalIncidents: 0,
  });

  useEffect(() => {
    if (user) {
      setRole(user.role);
    } else {
      setRole('');
    }
  }, [user]);

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        searchTerm: filters.searchTerm || undefined,
        status: filters.status || undefined,
        priority: filters.priority || undefined,
        page: filters.page,
        limit: filters.limit,
        sortBy: 'timestamp',
        order: 'desc'
      };
      const response = await getIncidents(params);
      setIncidents(response.data.incidents || []);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        totalIncidents: response.data.totalIncidents,
      });
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError('Failed to fetch incidents. ' + (err.response?.data?.error || err.message));
      }
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchIncidents();
    } else if (!authLoading && !user) {
      setIncidents([]);
      setError("Please log in to view incidents.");
      setLoading(false);
    }
  }, [authLoading, user, fetchIncidents]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleDeleteIncident = async (incidentId) => {
    if (window.confirm('Are you sure you want to delete this incident?')) {
      try {
        await deleteIncident(incidentId);
        fetchIncidents();
      } catch (err) {
        setError('Failed to delete incident. ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const displayIncidents = incidents.filter((inc) =>
    inc.title?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
    inc.description?.toLowerCase().includes(filters.searchTerm.toLowerCase())
  );

  const canManageIncidents = role === 'official' || role === 'commander';

  // Chart Data
  const priorityData = [
    incidents.filter(i => i.priority === 'high').length,
    incidents.filter(i => i.priority === 'medium').length,
    incidents.filter(i => i.priority === 'low').length,
  ];

  const statusData = [
    incidents.filter(i => i.status === 'reported').length,
    incidents.filter(i => i.status === 'assigned').length,
    incidents.filter(i => i.status === 'in-progress').length,
    incidents.filter(i => i.status === 'resolved').length,
    incidents.filter(i => i.status === 'closed').length,
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>Incident Dashboard {role ? <span style={{fontSize: '1.2rem', color: 'var(--secondary-color)'}}>({role.charAt(0).toUpperCase() + role.slice(1)})</span> : ''}</h2>
      </div>

      {/* Charts Section */}
      {!authLoading && !loading && !error && user && incidents.length > 0 && (
        <div style={styles.chartsSection}>
          <div style={styles.chartContainer}>
            <Doughnut
              data={{
                labels: ['High', 'Medium', 'Low'],
                datasets: [
                  {
                    label: 'Incidents by Priority',
                    data: priorityData,
                    backgroundColor: ['#dc3545aa', '#ffc107aa', '#28a745aa'],
                    borderColor: ['#dc3545', '#ffc107', '#28a745'],
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Incident Priority Distribution', font: { size: 16 } },
                },
              }}
            />
          </div>
          <div style={styles.chartContainer}>
            <Bar
              data={{
                labels: ['Reported', 'Assigned', 'In Progress', 'Resolved', 'Closed'],
                datasets: [
                  {
                    label: 'Incident Status',
                    data: statusData,
                    backgroundColor: '#007bffaa',
                    borderColor: '#007bff',
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { title: { display: true, text: 'Status Distribution', font: { size: 16 } } },
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
        </div>
      )}

      <div style={styles.filterSection}>
        <input
          type="text"
          name="searchTerm"
          placeholder="Search by title/description..."
          value={filters.searchTerm}
          onChange={handleFilterChange}
          style={styles.input}
        />
        <select name="status" value={filters.status} onChange={handleFilterChange} style={styles.select}>
          <option value="">All Statuses</option>
          <option value="reported">Reported</option>
          <option value="assigned">Assigned</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select name="priority" value={filters.priority} onChange={handleFilterChange} style={styles.select}>
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {authLoading && <p style={styles.loading}>Authenticating...</p>}
      {!authLoading && loading && <p style={styles.loading}>Loading incidents...</p>}
      {!authLoading && !loading && error && <p style={styles.error}>{error}</p>}

      {!authLoading && !loading && !error && user && (
        <>
          {displayIncidents.length > 0 ? (
            <>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Title</th>
                    <th style={styles.th}>Priority</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Reported By</th>
                    <th style={styles.th}>Commander</th>
                    <th style={styles.th}>Reported At</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayIncidents.map(incident => (
                    <tr key={incident._id}>
                      <td style={styles.td}>{incident.title}</td>
                      <td style={styles.td}>{incident.priority?.toUpperCase()}</td>
                      <td style={styles.td}>{incident.status?.replace('-', ' ')?.toUpperCase()}</td>
                      <td style={styles.td}>{incident.reportedBy?.username || 'N/A'}</td>
                      <td style={styles.td}>{incident.assignedCommander?.username || 'Not Assigned'}</td>
                      <td style={styles.td}>{new Date(incident.timestamp).toLocaleString()}</td>
                      <td style={styles.td}>
                        <Link to={`/incidents/${incident._id}`} style={styles.viewLink}>View</Link>
                        {canManageIncidents && (
                          <button
                            onClick={() => handleDeleteIncident(incident._id)}
                            style={{...styles.actionButton, ...styles.dangerButton, marginLeft: '5px'}}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={styles.paginationContainer}>
                <span>Page {pagination.currentPage} of {pagination.totalPages} (Total: {pagination.totalIncidents})</span>
                <div>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1}))}
                    disabled={pagination.currentPage <= 1}
                    style={styles.actionButton}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1}))}
                    disabled={pagination.currentPage >= pagination.totalPages}
                    style={styles.actionButton}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p style={styles.noIncidentsMessage}>No incidents recorded so far.</p>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;