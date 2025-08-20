import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function FredTable() {
  const [fredData, setFredData] = useState([]);
  const [formData, setFormData] = useState({ name: '', age: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFredData();
  }, []);

  const fetchFredData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/fred`);
      setFredData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch data.');
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.age) {
      setError('Name and age are required.');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/fred`, formData);
      fetchFredData();
      setFormData({ name: '', age: '' });
      setError('');
    } catch (err) {
      setError('Failed to create entry.');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/fred/${id}`);
      fetchFredData();
    } catch (err) {
      setError('Failed to delete entry.');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Fred Entries</h1>
      {error && <div className="p-2 mb-4 bg-red-100 text-red-700 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-4 mb-2">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Name"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            placeholder="Age"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Create
        </button>
      </form>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="p-3 bg-gray-200">Name</th>
            <th className="p-3 bg-gray-200">Age</th>
            <th className="p-3 bg-gray-200">Actions</th>
          </tr>
        </thead>
        <tbody>
          {fredData.map((fred) => (
            <tr key={fred.id} className="border-t">
              <td className="p-3">{fred.name}</td>
              <td className="p-3">{fred.age}</td>
              <td className="p-3">
                <button
                  onClick={() => handleDelete(fred.id)}
                  className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FredTable;
