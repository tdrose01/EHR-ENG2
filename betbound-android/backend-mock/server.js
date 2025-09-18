const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize JSON Schema validator
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

// Load JSON schemas
let stateSchema, operatorsSchema, nearestLegalSchema;

async function loadSchemas() {
  try {
    const stateSchemaPath = path.join(__dirname, '../api-contracts/schemas/state.json');
    const operatorsSchemaPath = path.join(__dirname, '../api-contracts/schemas/operators.json');
    const nearestLegalSchemaPath = path.join(__dirname, '../api-contracts/schemas/nearest-legal.json');
    
    stateSchema = JSON.parse(await fs.readFile(stateSchemaPath, 'utf8'));
    operatorsSchema = JSON.parse(await fs.readFile(operatorsSchemaPath, 'utf8'));
    nearestLegalSchema = JSON.parse(await fs.readFile(nearestLegalSchemaPath, 'utf8'));
    
    console.log('✅ JSON schemas loaded successfully');
  } catch (error) {
    console.error('❌ Error loading schemas:', error.message);
    process.exit(1);
  }
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// Request validation middleware
const validateSchema = (schema) => {
  return (req, res, next) => {
    const validate = ajv.compile(schema);
    const valid = validate(req.body);
    
    if (!valid) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Request body does not match expected schema',
        details: validate.errors
      });
    }
    
    next();
  };
};

// Mock data
const mockStates = {
  'CA': {
    state_code: 'CA',
    display_name: 'California',
    status: {
      online_sportsbook: false,
      retail: true,
      dfs: true,
      horse: true
    },
    age_minimum: 21,
    notes: [
      'Online sportsbooks not available',
      'DFS and horse wagering legal',
      'Retail locations only in specific counties'
    ],
    regulator: {
      name: 'California Gambling Control Commission',
      url: 'https://www.cgcc.ca.gov/'
    },
    operators: {
      sportsbooks: [],
      dfs: ['DraftKings', 'FanDuel', 'Yahoo Fantasy'],
      horse: ['TVG', 'TwinSpires', 'Xpressbet']
    },
    retail_locations: [
      {
        name: 'Golden Gate Fields',
        lat: 37.7749,
        lng: -122.4194,
        hours: 'Mon-Sun: 9:00 AM - 10:00 PM',
        phone: '(510) 559-7300',
        url: 'https://www.goldenatefields.com/'
      },
      {
        name: 'Santa Anita Park',
        lat: 34.1808,
        lng: -118.0492,
        hours: 'Daily: 6:00 AM - 2:00 AM',
        phone: '(626) 574-7223',
        url: 'https://www.santaanita.com/'
      }
    ],
    last_updated_utc: '2024-01-15T10:30:00Z'
  },
  'NV': {
    state_code: 'NV',
    display_name: 'Nevada',
    status: {
      online_sportsbook: true,
      retail: true,
      dfs: true,
      horse: true
    },
    age_minimum: 21,
    notes: [
      'Full online and retail sports betting available',
      'Must register in person for online accounts'
    ],
    regulator: {
      name: 'Nevada Gaming Control Board',
      url: 'https://gaming.nv.gov/'
    },
    operators: {
      sportsbooks: ['FanDuel', 'DraftKings', 'BetMGM', 'Caesars', 'William Hill'],
      dfs: ['DraftKings', 'FanDuel', 'Yahoo Fantasy'],
      horse: ['TVG', 'TwinSpires', 'Xpressbet']
    },
    retail_locations: [
      {
        name: 'Caesars Palace Sportsbook',
        lat: 36.1169,
        lng: -115.1747,
        hours: '24/7',
        phone: '(702) 731-7110',
        url: 'https://www.caesars.com/caesars-palace'
      }
    ],
    last_updated_utc: '2024-01-15T10:30:00Z'
  },
  'NJ': {
    state_code: 'NJ',
    display_name: 'New Jersey',
    status: {
      online_sportsbook: true,
      retail: true,
      dfs: true,
      horse: true
    },
    age_minimum: 21,
    notes: [
      'Full online and retail sports betting available',
      'Online registration allowed'
    ],
    regulator: {
      name: 'New Jersey Division of Gaming Enforcement',
      url: 'https://www.nj.gov/oag/ge/'
    },
    operators: {
      sportsbooks: ['FanDuel', 'DraftKings', 'BetMGM', 'Caesars', 'PointsBet'],
      dfs: ['DraftKings', 'FanDuel', 'Yahoo Fantasy'],
      horse: ['TVG', 'TwinSpires', 'Xpressbet']
    },
    retail_locations: [
      {
        name: 'Borgata Sportsbook',
        lat: 39.3643,
        lng: -74.4347,
        hours: '24/7',
        phone: '(609) 317-1000',
        url: 'https://www.borgataonline.com/'
      }
    ],
    last_updated_utc: '2024-01-15T10:30:00Z'
  },
  'NY': {
    state_code: 'NY',
    display_name: 'New York',
    status: {
      online_sportsbook: true,
      retail: true,
      dfs: true,
      horse: true
    },
    age_minimum: 21,
    notes: [
      'Full online and retail sports betting available',
      'Online registration allowed'
    ],
    regulator: {
      name: 'New York State Gaming Commission',
      url: 'https://gaming.ny.gov/'
    },
    operators: {
      sportsbooks: ['FanDuel', 'DraftKings', 'BetMGM', 'Caesars', 'PointsBet'],
      dfs: ['DraftKings', 'FanDuel', 'Yahoo Fantasy'],
      horse: ['TVG', 'TwinSpires', 'Xpressbet']
    },
    retail_locations: [
      {
        name: 'Resorts World Casino New York City',
        lat: 40.7128,
        lng: -74.0060,
        hours: '24/7',
        phone: '(718) 215-2828',
        url: 'https://www.rwnewyork.com/'
      }
    ],
    last_updated_utc: '2024-01-15T10:30:00Z'
  }
};

const mockOperators = {
  operators: [
    {
      name: 'FanDuel Sportsbook',
      android_uri: 'fanduel://sportsbook',
      android_package: 'com.fanduel.sportsbook',
      web_fallback: 'https://sportsbook.fanduel.com/',
      icon_url: 'https://cdn.betbound.com/icons/fanduel.png',
      description: "FanDuel Sportsbook - America's #1 Sportsbook"
    },
    {
      name: 'DraftKings Sportsbook',
      android_uri: 'draftkings://sportsbook',
      android_package: 'com.draftkings.sportsbook',
      web_fallback: 'https://sportsbook.draftkings.com/',
      icon_url: 'https://cdn.betbound.com/icons/draftkings.png',
      description: 'DraftKings Sportsbook - The King of Sports Betting'
    },
    {
      name: 'BetMGM',
      android_uri: 'betmgm://sportsbook',
      android_package: 'com.betmgm.sportsbook',
      web_fallback: 'https://sports.betmgm.com/',
      icon_url: 'https://cdn.betbound.com/icons/betmgm.png',
      description: 'BetMGM - The King of Sports'
    }
  ],
  dfs: [
    {
      name: 'DraftKings DFS',
      android_uri: 'draftkings://dfs',
      android_package: 'com.draftkings.dfs',
      web_fallback: 'https://www.draftkings.com/',
      icon_url: 'https://cdn.betbound.com/icons/draftkings-dfs.png',
      description: 'DraftKings Daily Fantasy Sports'
    },
    {
      name: 'FanDuel DFS',
      android_uri: 'fanduel://dfs',
      android_package: 'com.fanduel.dfs',
      web_fallback: 'https://www.fanduel.com/',
      icon_url: 'https://cdn.betbound.com/icons/fanduel-dfs.png',
      description: 'FanDuel Daily Fantasy Sports'
    }
  ],
  horse: [
    {
      name: 'TVG',
      android_uri: 'tvg://horse',
      android_package: 'com.tvg.horse',
      web_fallback: 'https://www.tvg.com/',
      icon_url: 'https://cdn.betbound.com/icons/tvg.png',
      description: 'TVG Horse Racing'
    },
    {
      name: 'TwinSpires',
      android_uri: 'twinspires://horse',
      android_package: 'com.twinspires.horse',
      web_fallback: 'https://www.twinspires.com/',
      icon_url: 'https://cdn.betbound.com/icons/twinspires.png',
      description: 'TwinSpires Horse Racing'
    }
  ],
  last_updated_utc: '2024-01-15T10:30:00Z'
};

// Routes

// GET /v1/states
app.get('/v1/states', (req, res) => {
  try {
    const stateSummaries = Object.values(mockStates).map(state => ({
      state_code: state.state_code,
      display_name: state.display_name,
      status: state.status,
      age_minimum: state.age_minimum,
      last_updated_utc: state.last_updated_utc
    }));
    
    res.json(stateSummaries);
  } catch (error) {
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to retrieve states'
    });
  }
});

// GET /v1/state/{code}
app.get('/v1/state/:code', (req, res) => {
  try {
    const { code } = req.params;
    const state = mockStates[code.toUpperCase()];
    
    if (!state) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'State not found'
      });
    }
    
    res.json(state);
  } catch (error) {
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to retrieve state'
    });
  }
});

// GET /v1/state/by-geo
app.get('/v1/state/by-geo', (req, res) => {
  try {
    const { lat, lng, state } = req.query;
    
    // Mock parameter for testing
    if (state) {
      const stateData = mockStates[state.toUpperCase()];
      if (stateData) {
        return res.json(stateData);
      }
    }
    
    // Simple mock logic based on coordinates
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    
    if (isNaN(latNum) || isNaN(lngNum)) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Invalid coordinates provided'
      });
    }
    
    // Mock state determination based on coordinates
    let stateCode = 'CA'; // Default to California
    
    if (latNum >= 36.0 && latNum <= 42.0 && lngNum >= -120.0 && lngNum <= -114.0) {
      stateCode = 'NV';
    } else if (latNum >= 38.0 && latNum <= 42.0 && lngNum >= -75.0 && lngNum <= -73.0) {
      stateCode = 'NJ';
    } else if (latNum >= 40.0 && latNum <= 45.0 && lngNum >= -80.0 && lngNum <= -72.0) {
      stateCode = 'NY';
    }
    
    const stateData = mockStates[stateCode];
    res.json(stateData);
  } catch (error) {
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to determine state by coordinates'
    });
  }
});

// GET /v1/retail/nearby
app.get('/v1/retail/nearby', (req, res) => {
  try {
    const { lat, lng, radius_km = 50, state } = req.query;
    
    // Mock parameter for testing
    if (state) {
      const stateData = mockStates[state.toUpperCase()];
      if (stateData && stateData.retail_locations) {
        return res.json(stateData.retail_locations);
      }
    }
    
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const radius = parseFloat(radius_km);
    
    if (isNaN(latNum) || isNaN(lngNum) || isNaN(radius)) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Invalid parameters provided'
      });
    }
    
    // Mock retail locations near coordinates
    const mockRetailLocations = [
      {
        name: 'Mock Sportsbook Location 1',
        lat: latNum + 0.01,
        lng: lngNum + 0.01,
        hours: 'Mon-Sun: 9:00 AM - 10:00 PM',
        phone: '(555) 123-4567',
        url: 'https://example.com/sportsbook1',
        distance_km: 5.2
      },
      {
        name: 'Mock Sportsbook Location 2',
        lat: latNum - 0.02,
        lng: lngNum + 0.02,
        hours: 'Daily: 6:00 AM - 2:00 AM',
        phone: '(555) 987-6543',
        url: 'https://example.com/sportsbook2',
        distance_km: 12.8
      }
    ];
    
    res.json(mockRetailLocations);
  } catch (error) {
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to retrieve nearby retail locations'
    });
  }
});

// GET /v1/legal/nearest
app.get('/v1/legal/nearest', (req, res) => {
  try {
    const { lat, lng, state } = req.query;
    
    // Mock parameter for testing
    if (state) {
      const stateData = mockStates[state.toUpperCase()];
      if (stateData && stateData.status.online_sportsbook) {
        return res.json({
          target_state_code: stateData.state_code,
          distance_km: 0,
          nearest_point_lat: parseFloat(lat) || 0,
          nearest_point_lng: parseFloat(lng) || 0,
          target_state_name: stateData.display_name,
          nearest_city: 'Current Location',
          estimated_drive_time_minutes: 0,
          route_summary: 'Already in legal state',
          last_updated_utc: '2024-01-15T10:30:00Z'
        });
      }
    }
    
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    
    if (isNaN(latNum) || isNaN(lngNum)) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Invalid coordinates provided'
      });
    }
    
    // Mock nearest legal location (Nevada)
    const nearestLegal = {
      target_state_code: 'NV',
      distance_km: 45.3,
      nearest_point_lat: 39.1638,
      nearest_point_lng: -119.7674,
      target_state_name: 'Nevada',
      nearest_city: 'Reno',
      estimated_drive_time_minutes: 45,
      route_summary: 'Take I-80 East to Reno',
      last_updated_utc: '2024-01-15T10:30:00Z'
    };
    
    res.json(nearestLegal);
  } catch (error) {
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to find nearest legal location'
    });
  }
});

// GET /v1/operators
app.get('/v1/operators', (req, res) => {
  try {
    res.json(mockOperators);
  } catch (error) {
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to retrieve operator catalog'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: 'Endpoint not found'
  });
});

// Start server
async function startServer() {
  await loadSchemas();
  
  app.listen(PORT, () => {
    console.log(`🚀 BetBound Mock API Server running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    console.log(`📍 States: http://localhost:${PORT}/v1/states`);
    console.log(`🎯 State by Geo: http://localhost:${PORT}/v1/state/by-geo?lat=37.7749&lng=-122.4194`);
    console.log(`🏪 Retail Nearby: http://localhost:${PORT}/v1/retail/nearby?lat=37.7749&lng=-122.4194`);
    console.log(`🗺️  Nearest Legal: http://localhost:${PORT}/v1/legal/nearest?lat=37.7749&lng=-122.4194`);
    console.log(`🎰 Operators: http://localhost:${PORT}/v1/operators`);
  });
}

startServer().catch(console.error);

