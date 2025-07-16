const pool = require('../db');

async function getAllWaterTests() {
    const result = await pool.query('SELECT * FROM water_tests ORDER BY timestamp_utc DESC');
    return result.rows;
}

async function createWaterTest(testData) {
    const {
        device_id,
        location_code,
        timestamp_utc,
        captured_by,
        method_code,
        value,
        unit,
        qualifier,
        sample_type,
        temp_c,
        residual_chlorine_mg_l,
        ph,
        turbidity_ntu
    } = testData;

    const result = await pool.query(
        `INSERT INTO water_tests (
            device_id, location_code, timestamp_utc, captured_by, method_code,
            value, unit, qualifier, sample_type, temp_c, residual_chlorine_mg_l, ph, turbidity_ntu
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
        [
            device_id, location_code, timestamp_utc, captured_by, method_code,
            value, unit, qualifier, sample_type, temp_c, residual_chlorine_mg_l, ph, turbidity_ntu
        ]
    );

    return result.rows[0];
}

module.exports = {
    getAllWaterTests,
    createWaterTest,
};