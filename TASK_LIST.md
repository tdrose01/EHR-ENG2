# US Navy E-Health App Task List

This task list is based on the requirements document and will be updated as we complete each item.

### Phase 1: Backend Development - Database and Core Logic

*   **1. Design and Implement Database Schema**
    *   [x] Create a generic `exposures` table with all common fields (`sample_id`, `device_id`, `location_code`, `timestamp_utc`, `captured_by`, `method_code`, `value`, `unit`, `qualifier`).
    *   [x] Create separate, domain-specific extension tables for each metric:
        *   [x] `air_quality_details` (duration_sec, flow_rate_lpm, filter_type)
        *   [x] `voc_details` (compound_name, media_type, humidity_pct)
        *   [x] `noise_details` (dosimeter_interval_min, laeq, peak_db)
        *   [x] `radiation_details` (detector_type, shielding_cm, calibration_date)
        *   [x] `water_details` (sample_type, temp_c, residual_chlorine_mg_l)
        *   [x] `heat_stress_details` (db_c, wb_c, globe_c, flag_color)
    *   [x] Establish foreign key relationships between the generic `exposures` table and the specific detail tables.

*   **2. Implement Data Ingestion Adapters**
    *   [x] **AERPS Sensor Hub:** Develop a FastAPI MQTT bridge to consume sensor data and push it to a Kafka topic.
    *   [x] **Draeger CMS Dock:** Create a polling service to watch for USB CSV file drops and ingest them via NiFi.
    *   [x] **NoisePro Dosimeter:** Build a gRPC microservice to handle JSON data uploads from dosimeters.
    *   [x] **SAMS RAD-1 Export:** Configure a NiFi batch loader to process CSV files from an SFTP server.
    *   [x] **Kestrel 5400 BLE:** Develop an edge-device listener to capture Bluetooth GATT data and send it via REST. (Skipped)
    *   [x] **DOEHR-IH:** Implement an HL7 v2 TCP listener to receive data and map it to the FHIR standard.
    *   [x] **NED CSV Upload:** Set up a cron-based loader to process CSV uploads from an SFTP location.

*   **3. Develop Backend API**
    *   [x] Create API endpoints for submitting new exposure data for all metric types.
    *   [x] Create API endpoints to query and retrieve exposure data, with filtering capabilities (by date, location, metric).
    *   [x] Create API endpoints to fetch aggregated data for UI visualizations.

*   **4. Build Alerting and Aggregation Engine**
    *   [x] Configure PostgreSQL `CHECK` constraints for basic data validation.
    *   [x] Set up TimescaleDB continuous aggregates to pre-calculate summary data (e.g., hourly averages).
    *   [x] Implement the threshold-based alerting rules engine:
        *   [x] PM2.5 > 35 µg/m³ for 1 hr → YELLOW FLAG
        *   [x] WBGT > 32 °C for 30 min → Heat Stress Flag RED
        *   [x] Radiation dose rate > 2 mrem/hr → Stop work order
    *   [x] Develop a notification service to dispatch alerts (e.g., to an IDC).

### Phase 2: Data Governance and Quality

*   **1. Implement Data Quality Rules**
    *   [x] **Calibration Enforcement:** Add logic to the ingestion process to reject records where `calibration_date` is more than 180 days old.
    *   [x] **Anomaly Detection:** Implement a Z-score calculation (> 3) to flag records for SME review.

*   **2. Implement Data Retention Policy**
    *   [x] Create a scheduled job to archive raw sensor data older than 5 years.
    *   [x] Create a scheduled job to archive aggregated data older than 10 years, per SECNAV M-5210.1.

### Phase 3: Frontend Development - UI/UX

*   **1. Develop Core UI Components**
    *   [x] **Heat Map Visualization:** Build a component to display exposure data overlaid on ship deck plans.
    *   [x] **Trend Charts:** Create dynamic charts to visualize metric trends over time, including upper and lower specification limits.
    *   [x] **Data Tables:** Implement sortable and filterable tables to display raw and aggregated data.

*   **2. Implement Reporting Feature**
    *   [x] **PDF Export:** Add a "one-click export" feature to generate PDF reports (e.g., for 8050 reports) from the displayed data.

*   **3. Integrate UI with Backend**
    *   [x] Connect the UI components to the backend API to fetch and display live data.
    *   [x] Ensure the UI updates in real-time as new data is ingested or alerts are triggered.
