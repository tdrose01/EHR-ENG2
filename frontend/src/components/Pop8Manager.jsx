import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function Pop8Manager() {
  const [records, setRecords] = useState([]);
  const [newRecord, setNewRecord] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/pop8`);
      setRecords(response.data);
    } catch (err) {
      setError('Failed to fetch records.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newRecord) return;

    try {
      const response = await axios.post(`${API_URL}/api/pop8`, { name: newRecord });
      setRecords([...records, response.data]);
      setNewRecord('');
    } catch (err) {
      setError('Failed to create record.');
      console.error(err);
    }
  };

  const handleUpdate = async (id, updatedRecord) => {
    try {
      const response = await axios.put(`${API_URL}/api/pop8/${id}`, updatedRecord);
      setRecords(records.map(record => (record.id === id ? response.data : record)));
      setSelectedRecord(null);
    } catch (err) {
      setError('Failed to update record.');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/pop8/${id}`);
      setRecords(records.filter(record => record.id !== id));
    } catch (err) {
      setError('Failed to delete record.');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4 bg-gray-100">
      {error && <div className="p-4 bg-red-100 text-red-700 rounded mb-4">{error}</div>}
      <div className="mb-4">
        <input
          type="text"
          value={newRecord}
          onChange={(e) => setNewRecord(e.target.value)}
          className="p-2 border rounded mr-2"
          placeholder="New record name"
        />
        <button onClick={handleCreate} className="p-2 bg-blue-500 text-white rounded">
          Add Record
        </button>
      </div>
      <table className="min-w-full bg-white shadow rounded">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map(record => (
            <tr key={record.id} className="text-center">
              <td className="py-2 px-4 border-b">{record.id}</td>
              <td className="py-2 px-4 border-b">{record.name}</td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={() => setSelectedRecord(record)}
                  className="p-1 bg-yellow-500 text-white rounded mb-1 mr-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(record.id)}
                  className="p-1 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedRecord && (
        <div className="bg-white p-4 mt-4 rounded shadow">
          <h3 className="text-xl mb-2">Edit Record</h3>
          <input
            type="text"
            value={selectedRecord.name}
            onChange={(e) => setSelectedRecord({ ...selectedRecord, name: e.target.value })}
            className="p-2 border rounded mr-2"
            placeholder="Record name"
          />
          <button
            onClick={() => handleUpdate(selectedRecord.id, selectedRecord)}
            className="p-2 bg-green-500 text-white rounded"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}

export default Pop8Manager;
