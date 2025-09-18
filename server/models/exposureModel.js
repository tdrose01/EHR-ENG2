const pool = require('../db');

/**
 * Retrieves a paginated and filtered list of exposure events.
 * Joins the generic 'exposures' table with all specific detail tables.
 *
 * @param {object} filters - The filter criteria.
 * @param {string} [filters.metric_type] - The type of metric to filter by (e.g., 'air_quality', 'noise').
 * @param {string} [filters.location_code] - The location code to filter by.
 * @param {string} [filters.start_date] - The start of the date range (ISO 8601).
 * @param {string} [filters.end_date] - The end of the date range (ISO 8601).
 * @param {number} [filters.page=1] - The page number for pagination.
 * @param {number} [filters.limit=20] - The number of records per page.
 * @returns {Promise<object>} An object containing the exposure records and pagination details.
 */
async function getExposures(filters = {}) {
  const {
    metric_type,
    location_code,
    start_date,
    end_date,
    page = 1,
    limit = 20
  } = filters;

  const queryParams = [];
  let whereClauses = [];

  let baseQuery = `
    SELECT
      e.sample_id, e.device_id, e.location_code, e.timestamp_utc, e.captured_by,
      e.method_code, e.value, e.unit, e.qualifier,
      aqd.*,
      vd.*,
      nd.*,
      rd.*,
      wd.*,
      hsd.*
    FROM exposures e
    LEFT JOIN air_quality_details aqd ON e.sample_id = aqd.sample_id
    LEFT JOIN voc_details vd ON e.sample_id = vd.sample_id
    LEFT JOIN noise_details nd ON e.sample_id = nd.sample_id
    LEFT JOIN radiation_details rd ON e.sample_id = rd.sample_id
    LEFT JOIN water_details wd ON e.sample_id = wd.sample_id
    LEFT JOIN heat_stress_details hsd ON e.sample_id = hsd.sample_id
  `;

  if (metric_type) {
    queryParams.push(metric_type);
    whereClauses.push(`e.metric_type = $${queryParams.length}`);
  }

  if (location_code) {
    queryParams.push(`%${location_code}%`);
    whereClauses.push(`e.location_code ILIKE $${queryParams.length}`);
  }

  if (start_date) {
    queryParams.push(start_date);
    whereClauses.push(`e.timestamp_utc >= $${queryParams.length}`);
  }

  if (end_date) {
    queryParams.push(end_date);
    whereClauses.push(`e.timestamp_utc <= $${queryParams.length}`);
  }

  if (whereClauses.length > 0) {
    baseQuery += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  // Get total count for pagination
  const totalQuery = `SELECT COUNT(*) FROM (${baseQuery}) as count_query`;
  const totalResult = await pool.query(totalQuery, queryParams);
  const total_records = parseInt(totalResult.rows[0].count, 10);
  const total_pages = Math.ceil(total_records / limit);

  // Add ordering and pagination to the main query
  baseQuery += ` ORDER BY e.timestamp_utc DESC`;
  const offset = (page - 1) * limit;
  queryParams.push(limit, offset);
  baseQuery += ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;

  const dataResult = await pool.query(baseQuery, queryParams);

  return {
    data: dataResult.rows,
    pagination: {
      current_page: page,
      total_pages,
      total_records,
      limit
    }
  };
}

module.exports = { getExposures };
