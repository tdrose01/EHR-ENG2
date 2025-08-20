import { query } from '../db.js';

// Get all pop8 entries
export async function getAllPop8() {
  const { rows } = await query('SELECT * FROM pop8 ORDER BY created_at DESC');
  return rows;
}

// Get single pop8 entry by ID
export async function getPop8ById(id) {
  const { rows } = await query('SELECT * FROM pop8 WHERE id = $1', [id]);
  return rows[0];
}

// Create a new pop8 entry
export async function createPop8(name, description, relatedEntityId) {
  const { rows } = await query(
    'INSERT INTO pop8 (name, description, related_entity_id) VALUES ($1, $2, $3) RETURNING *',
    [name, description, relatedEntityId]
  );
  return rows[0];
}

// Update an existing pop8 entry
export async function updatePop8(id, name, description, relatedEntityId) {
  const { rows } = await query(
    `UPDATE pop8
    SET name = $1, description = $2, related_entity_id = $3, updated_at = NOW()
    WHERE id = $4 RETURNING *`,
    [name, description, relatedEntityId, id]
  );
  return rows[0];
}

// Delete a pop8 entry
export async function deletePop8(id) {
  await query('DELETE FROM pop8 WHERE id = $1', [id]);
}
