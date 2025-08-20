import { query } from '../db.js';

// Create a new pop8 record
export async function createPop8(name, description) {
  const { rows } = await query('INSERT INTO pop8 (name, description) VALUES ($1, $2) RETURNING *', [name, description]);
  return rows[0];
}

// Get all pop8 records
export async function getAllPop8() {
  const { rows } = await query('SELECT * FROM pop8');
  return rows;
}

// Get a pop8 record by ID
export async function getPop8ById(id) {
  const { rows } = await query('SELECT * FROM pop8 WHERE id = $1', [id]);
  return rows[0];
}

// Update a pop8 record by ID
export async function updatePop8(id, name, description) {
  const { rows } = await query('UPDATE pop8 SET name = $1, description = $2 WHERE id = $3 RETURNING *', [name, description, id]);
  return rows[0];
}

// Delete a pop8 record by ID
export async function deletePop8(id) {
  const { rowCount } = await query('DELETE FROM pop8 WHERE id = $1', [id]);
  return rowCount > 0;
}
