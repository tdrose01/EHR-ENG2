const fs = require('fs').promises;
const path = require('path');

// Generate comprehensive test data for all 50 states + DC
const generateStateData = () => {
  const states = [
    { code: 'AL', name: 'Alabama', online: false, retail: false, dfs: false, horse: true, age: 21 },
    { code: 'AK', name: 'Alaska', online: false, retail: false, dfs: false, horse: true, age: 21 },
    { code: 'AZ', name: 'Arizona', online: true, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'AR', name: 'Arkansas', online: true, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'CA', name: 'California', online: false, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'CO', name: 'Colorado', online: true, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'CT', name: 'Connecticut', online: true, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'DE', name: 'Delaware', online: true, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'DC', name: 'District of Columbia', online: true, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'FL', name: 'Florida', online: false, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'GA', name: 'Georgia', online: false, retail: false, dfs: true, horse: true, age: 21 },
    { code: 'HI', name: 'Hawaii', online: false, retail: false, dfs: false, horse: true, age: 21 },
    { code: 'ID', name: 'Idaho', online: false, retail: false, dfs: false, horse: true, age: 21 },
    { code: 'IL', name: 'Illinois', online: true, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'IN', name: 'Indiana', online: true, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'IA', name: 'Iowa', online: true, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'KS', name: 'Kansas', online: true, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'KY', name: 'Kentucky', online: true, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'LA', name: 'Louisiana', online: true, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'ME', name: 'Maine', online: true, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'MD', name: 'Maryland', online: true, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'MA', name: 'Massachusetts', online: true, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'MI', name: 'Michigan', online: true, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'MN', name: 'Minnesota', online: false, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'MS', name: 'Mississippi', online: false, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'MO', name: 'Missouri', online: false, retail: false, dfs: true, horse: true, age: 21 },
    { code: 'MT', name: 'Montana', online: true, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'NE', name: 'Nebraska', online: false, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'NV', name: 'Nevada', online: true, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'NH', name: 'New Hampshire', online: true, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'NJ', name: 'New Jersey', online: true, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'NM', name: 'New Mexico', online: false, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'NY', name: 'New York', online: true, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'NC', name: 'North Carolina', online: true, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'ND', name: 'North Dakota', online: false, retail: false, dfs: true, horse: true, age: 21 },
    { code: 'OH', name: 'Ohio', online: true, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'OK', name: 'Oklahoma', online: false, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'OR', name: 'Oregon', online: false, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'PA', name: 'Pennsylvania', online: true, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'RI', name: 'Rhode Island', online: true, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'SC', name: 'South Carolina', online: false, retail: false, dfs: true, horse: true, age: 21 },
    { code: 'SD', name: 'South Dakota', online: false, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'TN', name: 'Tennessee', online: true, retail: false, dfs: true, horse: true, age: 21 },
    { code: 'TX', name: 'Texas', online: false, retail: false, dfs: true, horse: true, age: 21 },
    { code: 'UT', name: 'Utah', online: false, retail: false, dfs: false, horse: true, age: 21 },
    { code: 'VT', name: 'Vermont', online: true, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'VA', name: 'Virginia', online: true, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'WA', name: 'Washington', online: false, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'WV', name: 'West Virginia', online: true, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'WI', name: 'Wisconsin', online: false, retail: true, dfs: true, horse: true, age: 21 },
    { code: 'WY', name: 'Wyoming', online: true, retail: false, dfs: true, horse: true, age: 21 }
  ];

  const stateData = {};
  
  states.forEach(state => {
    const operators = {
      sportsbooks: state.online ? ['FanDuel', 'DraftKings', 'BetMGM', 'Caesars', 'PointsBet'] : [],
      dfs: state.dfs ? ['DraftKings', 'FanDuel', 'Yahoo Fantasy'] : [],
      horse: state.horse ? ['TVG', 'TwinSpires', 'Xpressbet'] : []
    };

    const notes = [];
    if (!state.online) notes.push('Online sportsbooks not available');
    if (!state.retail) notes.push('Retail sports betting not available');
    if (!state.dfs) notes.push('Daily fantasy sports not available');
    if (!state.horse) notes.push('Horse race wagering not available');

    stateData[state.code] = {
      state_code: state.code,
      display_name: state.name,
      status: {
        online_sportsbook: state.online,
        retail: state.retail,
        dfs: state.dfs,
        horse: state.horse
      },
      age_minimum: state.age,
      notes: notes.length > 0 ? notes : undefined,
      regulator: {
        name: `${state.name} Gaming Commission`,
        url: `https://gaming.${state.code.toLowerCase()}.gov/`
      },
      operators,
      retail_locations: state.retail ? [
        {
          name: `${state.name} Sportsbook Location`,
          lat: 40.0 + (Math.random() - 0.5) * 10,
          lng: -100.0 + (Math.random() - 0.5) * 20,
          hours: 'Mon-Sun: 9:00 AM - 10:00 PM',
          phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          url: `https://sportsbook.${state.code.toLowerCase()}.gov/`
        }
      ] : [],
      last_updated_utc: new Date().toISOString()
    };
  });

  return stateData;
};

async function generateTestData() {
  console.log('📊 Generating comprehensive test data...\n');
  
  try {
    const stateData = generateStateData();
    const outputPath = path.join(__dirname, '../data/generated-states.json');
    
    // Ensure data directory exists
    const dataDir = path.dirname(outputPath);
    await fs.mkdir(dataDir, { recursive: true });
    
    await fs.writeFile(outputPath, JSON.stringify(stateData, null, 2));
    
    console.log(`✅ Generated test data for ${Object.keys(stateData).length} states`);
    console.log(`📁 Saved to: ${outputPath}`);
    
    // Generate summary
    const onlineStates = Object.values(stateData).filter(s => s.status.online_sportsbook).length;
    const retailStates = Object.values(stateData).filter(s => s.status.retail).length;
    const dfsStates = Object.values(stateData).filter(s => s.status.dfs).length;
    const horseStates = Object.values(stateData).filter(s => s.status.horse).length;
    
    console.log('\n📈 Summary:');
    console.log(`   Online Sportsbooks: ${onlineStates} states`);
    console.log(`   Retail Sportsbooks: ${retailStates} states`);
    console.log(`   Daily Fantasy Sports: ${dfsStates} states`);
    console.log(`   Horse Race Wagering: ${horseStates} states`);
    
  } catch (error) {
    console.error('❌ Error generating test data:', error.message);
    process.exit(1);
  }
}

generateTestData().catch(console.error);
