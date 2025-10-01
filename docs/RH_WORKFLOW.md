# Radiation Health Dashboard Workflow

## Overview
The Radiation Health (RH) dashboard guides radiation program staff through onboarding monitored personnel, pairing radiation dosimetry devices, capturing exposure data, and submitting NAVMED 6470/1 exposure reports. The workflow below assumes an authenticated radiation-health user with access to `/radiation-dashboard` and `/navmed-test`.

## 1. Onboard Radiation Personnel ("Add Patient")
**Entry point:** Radiation Dashboard -> Personnel tab -> `Add Personnel` button.

1. Launch the Add Personnel modal (`AddRadiationPersonnelForm.vue`).
2. Populate required identity and billet fields: first name, last name, rank/rate, 10-digit EDIPI, and the unit assignment (unit list comes from `/api/radiation/units`).
3. Set radiation program metadata:
  - `Active` status toggles inclusion in device assignment lists.
  - Radiation category and monitoring frequency drive downstream compliance alerts.
  - Optional fields include dosimeter type, medical exam dates, and notes.
4. Submit to `POST /api/radiation/personnel`; editing an existing record issues `PUT /api/radiation/personnel/:id`.
5. Confirm the new personnel row appears in the Personnel table; use the row actions to edit, view readings, assign devices, or deactivate.

## 2. Assign a Device to Personnel
**Entry point:** Radiation Dashboard -> Devices tab (`Assign Device`) or Personnel/Assignments tab row actions -> `Assign`.

1. Open the Device Assignment modal (`DeviceAssignmentModal.vue`). Active personnel and non-retired devices are pre-filtered.
2. Choose personnel and device (both required). Assignment start timestamp is required; optionally set an end timestamp for temporary loans and capture notes.
3. Submitting triggers `POST /api/radiation/assignments`; editing an active assignment uses `PUT /api/radiation/assignments/:id`.
4. Confirm the assignment in the Assignments tab table. Status chips indicate Active, Scheduled, or Completed based on start/end timestamps.
5. If a device needs configuration updates (model, calibration due, RF policy), edit it via the Devices tab (`DeviceEditModal.vue`, `PUT /api/radiation/devices/:id`).

## 3. Capture Dose Readings
**Automated feed:** Assigned devices stream readings into `radiation_dose_readings` via BLE gateways.

**Manual entry (when automation is unavailable):**
1. Go to the Readings tab and click `Manual Entry` to open `ManualDoseReadingForm.vue`.
2. Select an active device (retired devices are filtered out). The form auto-populates the currently assigned person, if any, via `/api/radiation/assignments?active_only=true`.
3. Enter measurement timestamp, HP(10) dose (required), and optional HP(0.07), dose rate, battery percentage, and notes. Built-in validation prevents future timestamps, negative values, and out-of-range doses.
4. Submit to `POST /api/radiation/ingest/readings`. Successful saves return a reading ID, automatically refresh the readings table, and flag the row with a green "Manual" badge.
5. Use table filters (date, personnel) to verify placement and monitor for threshold-triggered alerts in the Alerts tab.

## 4. Produce NAVMED 6470/1 Exposure Reports
**Entry point:** `/navmed-test` route (NavMed 6470/1 Test Page) or embedded workflow.

1. Launch the NAVMED 6470/1 form component (`NavMed6470_1Form.vue`). It preloads personnel via `GET /api/radiation/personnel` and allows draft persistence in local storage.
2. Choose report type (Annual, Situational, Over-Limit). Over-limit selections expose additional required fields such as exceeded limit, circumstances, and notification data.
3. Define the reporting period and calendar year, then enter dose equivalents (deep, shallow, extremity, internal) pulled from reconciliation data or manual calculations. Add remarks, investigation notes, and medical follow-up details as needed.
4. Submit to `POST /api/radiation/reports/6470-1`. Successful submissions return `report_id` and clear the form; drafts can be saved/loaded locally until submission.
5. Track submitted reports via the system status cards on the NavMed test page and maintain supporting documentation (assignment logs, reading exports) for audits.

## 5. Ongoing Monitoring & Preparation for Future Reports
- Use the Reconciliation tab to compare operational versus NDC doses prior to drafting NAVMED reports; export data as needed.
- Review Alerts to ensure any high-dose events are acknowledged and investigated prior to report submission.
- For unit-level oversight, leverage the Unit Management tab to confirm personnel assignments stay aligned with organizational structure.
- Schedule periodic exports (future enhancement) or database pulls to archive readings that support annual report packages.

## Process Dependencies & Data Flow Summary
1. Personnel onboarding populates `/api/radiation/personnel`, enabling device assignment lists, readings attribution, and report personnel pickers.
2. Device assignments (`/api/radiation/assignments`) tie personnel to hardware, enabling automated ingestion and contextual data in manual forms.
3. Readings ingestion populates `radiation_dose_readings`, feeding the Readings, Alerts, and Reconciliation tabs.
4. NAVMED reports draw on personnel metadata and dose history to satisfy Navy reporting requirements.

Maintaining this order--personnel -> assignment -> readings -> reporting--ensures data integrity, accurate exposure tracking, and compliant reporting within the RH dashboard.
