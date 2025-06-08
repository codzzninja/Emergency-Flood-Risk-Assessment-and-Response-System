import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const ManageIncidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ search: '', status: '', priority: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const incidentsPerPage = 5;

  const token = localStorage.getItem('token');

  const fetchIncidents = async () => {
    if (!token) {
      setError('You must be logged in.');
      return;
    }

    try {
      const res = await axios.get('http://localhost:5000/api/incidents', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data) ? res.data : res.data.incidents;
      setIncidents(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch incidents.');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this incident?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/incidents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchIncidents();
    } catch (err) {
      console.error(err);
      alert('Failed to delete incident.');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/incidents/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchIncidents();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const filteredIncidents = incidents.filter((inc) =>
    (filters.status === '' || inc.status === filters.status) &&
    (filters.priority === '' || inc.priority === filters.priority) &&
    (filters.search === '' || inc.title?.toLowerCase().includes(filters.search.toLowerCase()))
  );

  const sortedIncidents = [...filteredIncidents].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const indexOfLast = currentPage * incidentsPerPage;
  const indexOfFirst = indexOfLast - incidentsPerPage;
  const currentIncidents = sortedIncidents.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredIncidents.length / incidentsPerPage);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const exportToExcel = () => {
    const exportData = filteredIncidents.map((inc) => ({
      Title: inc.title || '',
      Description: inc.description || '',
      Priority: inc.priority || '',
      Status: inc.status || '',
      ReportedBy: inc.reportedBy?.username || 'Unknown',
      Timestamp: new Date(inc.timestamp).toLocaleString() || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Incidents');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'incidents.xlsx');
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Manage Incidents</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Filters and Export */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by title"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="border px-3 py-2 flex-1 min-w-[200px]"
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="border px-3 py-2"
        >
          <option value="">All Statuses</option>
          <option value="reported">Reported</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className="border px-3 py-2"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button onClick={exportToExcel} className="ml-auto bg-green-600 text-white px-4 py-2 rounded">
          Export to Excel
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              {['title', 'description', 'priority', 'status', 'reportedBy', 'timestamp'].map((col) => (
                <th
                  key={col}
                  onClick={() => requestSort(col)}
                  className="px-4 py-2 cursor-pointer hover:underline"
                >
                  {col.charAt(0).toUpperCase() + col.slice(1)}
                </th>
              ))}
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentIncidents.map((inc) => (
              <tr key={inc._id} className="border-t">
                <td className="px-4 py-2">{inc.title}</td>
                <td className="px-4 py-2">{inc.description}</td>
                <td className="px-4 py-2 capitalize">{inc.priority}</td>
                <td className="px-4 py-2">
                  <select
                    value={inc.status}
                    onChange={(e) => handleStatusChange(inc._id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="reported">Reported</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>
                <td className="px-4 py-2">{inc.reportedBy?.username || 'Unknown'}</td>
                <td className="px-4 py-2">{new Date(inc.timestamp).toLocaleString()}</td>
                <td className="px-4 py-2">
                  <Link to={`/incidents/${inc._id}`} className="text-blue-600 hover:underline mr-2">
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(inc._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredIncidents.length === 0 && (
          <p className="text-center text-gray-500 mt-6">No matching incidents found.</p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded border ${
                currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageIncidents;
