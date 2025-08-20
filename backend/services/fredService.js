import { query } from '../db.js';

// Function to get all fred entries
export async function getAllFred() {
    const { rows } = await query('SELECT * FROM fred;');
    return rows;
}

// Function to get a single fred entry by id
export async function getFredById(id) {
    const { rows } = await query('SELECT * FROM fred WHERE id = $1;', [id]);
    return rows[0];
}

// Function to create a new fred entry
export async function createFred(name, description) {
    const { rows } = await query(
        'INSERT INTO fred (name, description) VALUES ($1, $2) RETURNING *;',
        [name, description]
    );
    return rows[0];
}

// Function to update a fred entry
export async function updateFred(id, name, description) {
    const { rows } = await query(
        'UPDATE fred SET name = $1, description = $2 WHERE id = $3 RETURNING *;',
        [name, description, id]
    );
    return rows[0];
}

// Function to delete a fred entry
export async function deleteFred(id) {
    const { rowCount } = await query('DELETE FROM fred WHERE id = $1;', [id]);
    return rowCount > 0;
}
