const http = require('http');

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3005,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        let parsedData;
        try {
          parsedData = JSON.parse(responseData);
        } catch {
          parsedData = responseData;
        }
        
        resolve({
          status: res.statusCode,
          data: parsedData,
          ok: res.statusCode >= 200 && res.statusCode < 300
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        status: 0,
        data: { error: error.message },
        ok: false
      });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testNavmedAPI() {
  console.log('Testing NAVMED 6470/1 API...\n');

  // Test 1: Basic connectivity
  console.log('1. Testing basic connectivity...');
  const testResponse = await makeRequest('/api/radiation/test');
  console.log('Status:', testResponse.status);
  console.log('Response:', testResponse.data);
  console.log('');

  // Test 2: Get personnel
  console.log('2. Getting personnel data...');
  const personnelResponse = await makeRequest('/api/radiation/personnel');
  console.log('Status:', personnelResponse.status);
  console.log('Personnel count:', personnelResponse.data?.length || 0);
  console.log('');

  // Test 3: Submit a valid report
  console.log('3. Submitting valid annual report...');
  const reportData = {
    report_type: 'ANNUAL',
    personnel_id: 1,
    period_start: '2024-01-01',
    period_end: '2024-12-31',
    calendar_year: 2024,
    deep_dose_msv: 2.5,
    shallow_dose_msv: 15.0,
    extremity_dose_msv: 8.0,
    internal_dose_msv: 0.0,
    prepared_by: 'Test User',
    date_prepared: '2024-12-15',
    rso_signature: 'RSO Signature',
    command_signature: 'Command Signature',
    comments: 'Test annual report'
  };

  const submitResponse = await makeRequest('/api/radiation/reports/6470-1', 'POST', reportData);
  console.log('Status:', submitResponse.status);
  console.log('Response:', submitResponse.data);
  console.log('');

  // Test 4: Get reports
  console.log('4. Getting reports...');
  const reportsResponse = await makeRequest('/api/radiation/reports/6470-1');
  console.log('Status:', reportsResponse.status);
  console.log('Reports count:', reportsResponse.data?.reports?.length || 0);
  console.log('');

  // Test 5: Test validation
  console.log('5. Testing validation (invalid report type)...');
  const invalidData = {
    report_type: 'INVALID_TYPE',
    personnel_id: 1,
    period_start: '2024-01-01',
    period_end: '2024-12-31',
    prepared_by: 'Test User',
    date_prepared: '2024-12-15'
  };

  const validationResponse = await makeRequest('/api/radiation/reports/6470-1', 'POST', invalidData);
  console.log('Status:', validationResponse.status);
  console.log('Response:', validationResponse.data);
  console.log('');

  console.log('Test completed!');
}

testNavmedAPI().catch(console.error);
