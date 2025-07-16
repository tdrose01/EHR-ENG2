const request = require('supertest');
const express = require('express');
const exposureRoutes = require('../routes/exposures');

// Mock the database model to avoid actual DB calls
jest.mock('../models/exposureModel');
const { getExposures } = require('../models/exposureModel');

const app = express();
app.use(express.json());
app.use('/api/exposures', exposureRoutes);

describe('GET /api/exposures', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a 200 status code and a paginated list of exposures', async () => {
    const mockData = {
      data: [{ sample_id: '123', value: 85 }],
      pagination: { current_page: 1, total_pages: 1, total_records: 1, limit: 20 },
    };
    getExposures.mockResolvedValue(mockData);

    const res = await request(app).get('/api/exposures');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(mockData);
    expect(getExposures).toHaveBeenCalledWith(expect.objectContaining({ page: 1, limit: 20 }));
  });

  it('should correctly pass filter parameters to the model', async () => {
    getExposures.mockResolvedValue({ data: [], pagination: {} });

    const filters = {
      metric_type: 'noise',
      location_code: 'ENGINE_ROOM',
      start_date: '2025-01-01',
      end_date: '2025-01-31',
      page: 2,
      limit: 10,
    };

    await request(app).get('/api/exposures').query(filters);

    expect(getExposures).toHaveBeenCalledWith(expect.objectContaining(filters));
  });

  it('should handle errors gracefully and return a 500 status code', async () => {
    const errorMessage = 'Database error';
    getExposures.mockRejectedValue(new Error(errorMessage));

    const res = await request(app).get('/api/exposures');

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({ error: 'Internal server error' });
  });
});

