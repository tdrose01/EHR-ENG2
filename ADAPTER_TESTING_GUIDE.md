# Testing Guide: Data Ingestion Adapters

This document provides a comprehensive guide for testing the suite of microservice-based data ingestion adapters located in the `server/` directory.

## 1. Overview

The testing strategy for the adapters is twofold:
- **Automated Testing:** For services with complex internal logic, `pytest` test suites are provided to verify core functionality in isolation.
- **Manual Integration Testing:** For services that act as bridges or depend heavily on external systems (like MQTT brokers or SFTP servers), manual testing is required to confirm end-to-end connectivity.

---

## 2. Testing Procedures by Adapter

### 2.1 `anomaly_detection_service`

- **Type:** Automated
- **Description:** This service contains logic for detecting anomalies in data. The tests verify the correctness of the detection algorithms.
- **Command:**
  ```bash
  pytest server/anomaly_detection_service/
  ```
- **Expected Result:** All tests should pass.

### 2.2 `csv_polling_service`

- **Type:** Manual Integration
- **Description:** This service watches a directory for new CSV files and sends their content to a NiFi endpoint.
- **Setup:**
  1. Create a `.env` file in `server/csv_polling_service/` based on the `.env.example`.
  2. Set `WATCH_DIRECTORY` to a real directory path on your local machine.
  3. Ensure the `NIFI_ENDPOINT_URL` is a valid, running endpoint that can receive POST requests.
- **Test Steps:**
  1. Run the service: `python server/csv_polling_service/main.py`.
  2. While the service is running, copy a sample CSV file into the `WATCH_DIRECTORY`.
- **Expected Result:**
  - The service's console output should log the detection of the new file.
  - It should log the number of records parsed.
  - It should log a successful POST request to the NiFi endpoint.

### 2.3 `data_retention_service`

- **Type:** Automated
- **Description:** This service manages the data retention policy. The tests verify that the correct data is identified for pruning based on the configured rules.
- **Command:**
  ```bash
  pytest server/data_retention_service/
  ```
- **Expected Result:** All tests should pass.

### 2.4 `grpc_service`

- **Type:** Automated
- **Description:** This service provides a gRPC endpoint for high-performance data ingestion. The tests mock the database and gRPC context to verify the servicer logic.
- **Command:**
  ```bash
  python -m pytest server/grpc_service/
  ```
- **Note:** It is important to run this test with `python -m pytest` to ensure the local project structure is correctly added to the Python path, avoiding potential `ModuleNotFoundError` issues.
- **Expected Result:** All tests should pass.

### 2.5 `hl7_listener`

- **Type:** Manual Integration
- **Description:** This service listens for incoming HL7 v2 messages over MLLP, parses them, and posts them to a FHIR server.
- **Setup:**
  1. Create a `.env` file in `server/hl7_listener/` based on the `.env.example`.
  2. Ensure the `FHIR_SERVER_ENDPOINT` is a valid, running endpoint.
- **Test Steps:**
  1. Run the service: `python server/hl7_listener/main.py`.
  2. Use an HL7 testing tool (like HL7 Soup or a simple MLLP client script) to send a sample ORU_R01 message to the listener on the configured host and port.
- **Expected Result:**
  - The service's console should log the receipt of the message.
  - The service should return a positive `AA` (Application Accept) acknowledgement.
  - The corresponding FHIR Observation resource should appear at the configured FHIR endpoint.

### 2.6 `mqtt_bridge`

- **Type:** Manual Integration
- **Description:** This service bridges messages from an MQTT topic to a Kafka topic.
- **Setup:**
  1. Create a `.env` file in `server/mqtt_bridge/` based on the `.env.example`.
  2. Ensure an MQTT broker and a Kafka instance are running and accessible at the configured addresses.
- **Test Steps:**
  1. Run the service: `python server/mqtt_bridge/main.py`.
  2. Use an MQTT client (like MQTTX or mosquitto_pub) to publish a JSON payload to the configured `MQTT_TOPIC`.
  3. Use a Kafka consumer tool to listen to the configured `KAFKA_TOPIC`.
- **Expected Result:**
  - The service's console should log the receipt of the message from MQTT.
  - The same message should appear in the Kafka topic.

### 2.7 `nifi_sftp_loader`

- **Type:** Manual (Component Verification)
- **Description:** This is not a standalone service but a Python script (`process_rad_data.py`) designed to be run within an Apache NiFi `ExecuteScript` processor.
- **Test Steps:**
  1. Review the logic in `nifi_flow_plan.md` to understand the data flow.
  2. Manually inspect the Python script `process_rad_data.py`.
  3. The script's logic is to read FlowFile attributes and generate SQL INSERT statements. Verify that the generated SQL matches the database schema for the `exposures` and `radiation_details` tables.
- **Expected Result:** The logic in the script should be sound and produce valid SQL based on the expected input attributes. Full testing requires a running NiFi instance.

### 2.8 `sftp_cron_loader`

- **Type:** Manual Integration
- **Description:** This script is designed to be run as a cron job. It connects to an SFTP server, downloads CSV files, and inserts their contents into the database.
- **Setup:**
  1. Create a `.env` file in `server/sftp_cron_loader/` based on the `.env.example`.
  2. Provide valid credentials for a running SFTP server and a PostgreSQL database.
  3. Place a sample CSV file (with the expected columns) in the `SFTP_REMOTE_DIR` on the SFTP server.
- **Test Steps:**
  1. Run the script directly: `python server/sftp_cron_loader/process_sftp_files.py`.
- **Expected Result:**
  - The script's console output should log a successful connection to both the SFTP server and the database.
  - It should log the processing of the file.
  - The data from the CSV file should appear in the `exposures` and `water_details` tables in the database.
  - The original CSV file should be removed from the SFTP server.
