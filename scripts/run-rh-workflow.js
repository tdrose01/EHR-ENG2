#!/usr/bin/env node

const crypto = require('crypto');

const fetchImpl = typeof fetch === 'function'
  ? (url, options) => fetch(url, options)
  : (...args) => import('node-fetch').then(({ default: fetchFromImport }) => fetchFromImport(...args));

const BASE_URL = process.env.RH_WORKFLOW_BASE_URL || 'http://localhost:3005';
const API_BASE = `${BASE_URL.replace(/\/+$/, '')}/api/radiation`;

const colors = {
  reset: '\x1b[0m',
  info: '\x1b[36m',
  success: '\x1b[32m',
  warn: '\x1b[33m',
  error: '\x1b[31m'
};

function log(message, tone = 'info') {
  const color = colors[tone] || colors.info;
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(title) {
  const bar = '-'.repeat(title.length + 4);
  console.log(`\n${colors.info}${bar}`);
  console.log(`| ${title} |`);
  console.log(`${bar}${colors.reset}`);
}

async function request(method, path, body) {
  const url = `${API_BASE}${path}`;
  const options = { method, headers: { Accept: 'application/json' } };
  if (body !== undefined && body !== null) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const response = await fetchImpl(url, options);
  const rawText = await response.text();
  let data = null;

  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch (parseError) {
      data = rawText;
    }
  }

  if (!response.ok) {
    const reason = data && typeof data === 'object' && data.error ? data.error : response.statusText;
    throw new Error(`${method} ${path} failed (${response.status}): ${reason}`);
  }

  return data;
}

function uniqueSuffix() {
  return Date.now().toString(36).toUpperCase().slice(-6);
}

function generateEdipi() {
  return (Math.floor(1000000000 + Math.random() * 9000000000)).toString();
}

function generateUuid() {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const rand = (Math.random() * 16) | 0;
    const value = char === 'x' ? rand : (rand & 0x3) | 0x8;
    return value.toString(16);
  });
}

function countRecords(payload) {
  if (Array.isArray(payload)) {
    return payload.length;
  }

  if (payload && typeof payload === 'object') {
    const preferredKeys = ['data', 'items', 'reports', 'rows', 'records'];
    for (const key of preferredKeys) {
      if (Array.isArray(payload[key])) {
        return payload[key].length;
      }
    }

    for (const value of Object.values(payload)) {
      if (Array.isArray(value)) {
        return value.length;
      }
    }
  }

  return 0;
}

(async () => {
  try {
    logStep('Verifying radiation API availability');
    const overview = await request('GET', '/overview');
    log(`Overview retrieved (personnel: ${overview?.personnelMonitored ?? 'n/a'}, devices: ${overview?.activeDevices ?? 'n/a'})`);

    logStep('Creating radiation unit');
    const unitPayload = {
      uic: `UIC${uniqueSuffix()}`,
      name: `Radiation Det ${uniqueSuffix()}`,
      parent_uic: null
    };
    const unitResponse = await request('POST', '/units', unitPayload);
    const unitId = unitResponse.unit_id;
    log(`Created unit ${unitPayload.name} (ID ${unitId})`, 'success');

    logStep('Onboarding radiation personnel');
    const personnelPayload = {
      fname: 'Test',
      lname: `Operator ${uniqueSuffix()}`,
      rank_rate: 'HN',
      edipi: generateEdipi(),
      unit_id: unitId,
      active: true,
      radiation_category: 'CAT2', // satisfies chk_radiation_category constraint
      monitoring_frequency: 'MONTHLY',
      dosimeter_type: 'DT-16',
      last_medical_exam: new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0],
      next_medical_due: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
      notes: 'Created by run-rh-workflow automation script'
    };
    const personnelResponse = await request('POST', '/personnel', personnelPayload);
    const personnelId = personnelResponse.personnel_id;
    log(`Created personnel ${personnelPayload.lname} (ID ${personnelId})`, 'success');

    logStep('Ensuring radiation device model');
    const deviceModels = await request('GET', '/device-models');
    let modelId;
    if (Array.isArray(deviceModels) && deviceModels.length > 0) {
      const firstModel = deviceModels[0];
      modelId = firstModel.id || firstModel.model_id || firstModel.modelId;
      log(`Reusing device model ${firstModel.model || firstModel.name || modelId} (ID ${modelId})`);
    } else {
      const modelPayload = {
        vendor: 'Workflow Instruments',
        model: `WF-${uniqueSuffix()}`,
        firmware_min: '1.0.0',
        hp10_support: true,
        hp007_support: true,
        gatt_service_uuid: generateUuid(),
        gatt_char_uuid: generateUuid()
      };
      const modelResponse = await request('POST', '/device-models', modelPayload);
      modelId = modelResponse.model_id;
      log(`Created device model ${modelPayload.model} (ID ${modelId})`, 'success');
    }

    logStep('Provisioning radiation device');
    const deviceSerial = `WF-${uniqueSuffix()}-${Math.floor(Math.random() * 1000)}`;
    const devicePayload = {
      model_id: modelId,
      serial: deviceSerial,
      ble_mac: null,
      firmware: '1.2.3',
      calib_due: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      rf_policy: 'NORMAL' // allowed by chk_rf_policy constraint
    };
    const deviceResponse = await request('POST', '/devices', devicePayload);
    const deviceId = deviceResponse.device_id;
    log(`Registered device ${deviceSerial} (ID ${deviceId})`, 'success');

    logStep('Assigning device to personnel');
    const now = new Date();
    const assignmentPayload = {
      device_id: deviceId,
      personnel_id: personnelId,
      start_ts: now.toISOString(),
      end_ts: null,
      notes: 'Automated assignment from workflow script'
    };
    const assignmentResponse = await request('POST', '/assignments', assignmentPayload);
    const assignmentId = assignmentResponse.assignment_id;
    log(`Assignment created (ID ${assignmentId})`, 'success');

    logStep('Recording manual dose reading');
    const readingPayload = {
      device_serial: deviceSerial,
      measured_ts: new Date(now.getTime() - 60000).toISOString(),
      hp10_mSv: 0.012,
      hp007_mSv: 0.009,
      rate_uSv_h: 0.45,
      battery_pct: 96,
      gateway_id: 'MANUAL_WORKFLOW',
      data_source: 'MANUAL',
      entered_by: 'workflow-script',
      notes: 'Dose reading generated by run-rh-workflow automation script',
      raw_json: JSON.stringify({ source: 'workflow-script', version: 1 }),
      payload_sig: null,
      sig_alg: null
    };
    const readingResponse = await request('POST', '/ingest/readings', readingPayload);
    const readingId = readingResponse.reading_id;
    log(`Manual dose reading captured (ID ${readingId})`, 'success');

    logStep('Submitting NAVMED 6470/1 report');
    const periodStart = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
    const periodEnd = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
    const reportPayload = {
      report_type: 'ANNUAL',
      personnel_id: personnelId,
      period_start: periodStart,
      period_end: periodEnd,
      calendar_year: now.getFullYear(),
      deep_dose_msv: 0.012,
      shallow_dose_msv: 0.018,
      extremity_dose_msv: 0.004,
      internal_dose_msv: 0,
      prepared_by: 'LT Workflow',
      date_prepared: now.toISOString().split('T')[0],
      rso_signature: 'LT Workflow',
      command_signature: 'CDR Example',
      comments: 'Report generated automatically by run-rh-workflow script'
    };
    const reportResponse = await request('POST', '/reports/6470-1', reportPayload);
    const reportId = reportResponse.report_id;
    log(`NAVMED report submitted (ID ${reportId})`, 'success');

    logStep('Workflow verification snapshot');
    const assignmentList = await request('GET', `/assignments?personnel_id=${personnelId}&limit=5`);
    const readingList = await request('GET', `/readings?device_id=${deviceId}&limit=5`);
    const reportList = await request('GET', `/reports/6470-1?personnel_id=${personnelId}&limit=5`);
    log(`Assignments found: ${countRecords(assignmentList)}`);
    log(`Recent readings: ${countRecords(readingList)}`);
    log(`Report count: ${countRecords(reportList)}`);

    logStep('Radiation health workflow completed successfully');
    process.exit(0);
  } catch (error) {
    log(`Workflow failed: ${error.message}`, 'error');
    process.exit(1);
  }
})();


