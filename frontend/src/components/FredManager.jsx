import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function FredManager() {
  const [freds, setFreds] = useState([]);
  const [newFred, setNewFred] = useState({ name: '', description: '' });
  const [editFred, setEditFred] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFreds = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/fred`);
        setFreds(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch fred entries.');
        setLoading(false);
      }
    };

    fetchFreds();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newFred.name || !newFred.description) {
      setError('Please fill out all fields.');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/fred`, newFred);
      setFreds([...freds, response.data]);
      setNewFred({ name: '', description: '' });
      setError('');
    } catch (err) {
      setError('Failed to create fred entry.');
    }
  };

  const handleUpdate = async (fred) => {
    if (!editFred.name || !editFred.description) {
      setError('Please fill out all fields.');
      return;
    }

    try {
      const response = await axios.put(`${API_URL}/api/fred/${fred.id}`, editFred);
      setFreds(freds.map((f) => (f.id === fred.id ? response.data : f)));
      setEditFred(null);
      setError('');
    } catch (err) {
      setError('Failed to update fred entry.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/fred/${id}`);
      setFreds(freds.filter((f) => f.id !== id));
    } catch (err) {
      setError('Failed to delete fred entry.');
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      {error && <div className="bg-red-100 text-red-700 p-2 mb-2 rounded">{error}</div>}
      <h1 className="text-2xl font-bold mb-4">Fred Manager</h1>

      <form onSubmit={handleCreate} className="mb-4">
        <div className="flex mb-2">
          <input
            type="text"
            placeholder="Name"
            value={newFred.name}
            onChange={(e) => setNewFred({ ...newFred, name: e.target.value })}
            className="p-2 bg-gray-100 rounded mr-2"
          />
          <input
            type="text"
            placeholder="Description"
            value={newFred.description}
            onChange={(e) => setNewFred({ ...newFred, description: e.target.value })}
            className="p-2 bg-gray-100 rounded"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Create Fred
        </button>
      </form>

      <ul className="space-y-2">
        {freds.map((fred) => (
          <li key={fred.id} className="p-2 bg-gray-200 rounded flex justify-between">
            {editFred && editFred.id === fred.id ? (
              <div className="flex">
                <input
                  type="text"
                  value={editFred.name}
                  onChange={(e) => setEditFred({ ...editFred, name: e.target.value })}
                  className="p-2 bg-gray-100 rounded mr-2"
                />
                <input
                  type="text"
                  value={editFred.description}
                  onChange={(e) => setEditFred({ ...editFred, description: e.target.value })}
                  className="p-2 bg-gray-100 rounded"
                />
                <button
                  onClick={() => handleUpdate(fred)}
                  className="bg-green-500 text-white p-2 rounded ml-2"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditFred(null)}
                  className="bg-gray-500 text-white p-2 rounded ml-2"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex justify-between flex-grow">
                <span>{fred.name}</span>
                <span>{fred.description}</span>
                <button
                  onClick={() => setEditFred(fred)}
                  className="bg-yellow-500 text-white p-2 rounded ml-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(fred.id)}
                  className="bg-red-500 text-white p-2 rounded ml-2"
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FredManager;
