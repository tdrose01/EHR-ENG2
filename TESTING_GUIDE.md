# Testing Guide: Environmental Exposure Backend

This guide provides instructions on how to test the new backend functionality for the Environmental Exposure Tracking system.

## 1. Prerequisites

Before you begin, ensure the following services are running:

- **PostgreSQL Database:** With the TimescaleDB extension enabled.
- **Main Node.js Backend:** `npm run start` from the project root.
- **The specific microservice you are testing** (e.g., MQTT Bridge, gRPC service).
- **(Optional) Supporting Services:** For full end-to-end testing, you may need:
  - An MQTT Broker (e.g., Mosquitto).
  - A Kafka instance.
  - A mock SFTP server.

## 2. Database Schema Verification

Connect to your PostgreSQL database using `psql` and run the following commands to verify the new tables have been created correctly.

```sql
-- List all new tables
\dt exposures;
\dt air_quality_details;
\dt voc_details;
\dt noise_details;
\dt radiation_details;
\dt water_details;
\dt heat_stress_details;

-- Check the columns of the main table
\d exposures;

-- Check the columns of a detail table
\d noise_details;
```

## 3. Testing Data Ingestion Microservices

For each microservice, follow the instructions to run the service, send it test data, and verify the results.

---

### a. MQTT Bridge (AERPS Sensor Hub)

1.  **Run the Service:**
    ```bash
    cd server/mqtt_bridge
    # Install dependencies if you haven't already
    # pip install -r requirements.txt
    uvicorn main:app --reload --port 8001
    ```
2.  **Send Test Data:** Use the following Python script (`test_mqtt_publisher.py`) to send a sample message. Make sure to `pip install paho-mqtt`.
    ```python
    # test_mqtt_publisher.py
    import paho.mqtt.client as mqtt
    import json
    import time

    MQTT_BROKER = "localhost"
    MQTT_PORT = 1883
    MQTT_TOPIC = "sensors/aerps"

    client = mqtt.Client()
    client.connect(MQTT_BROKER, MQTT_PORT)

    payload = {
      "device_id": "AERPS-001",
      "location_code": "CIWS_COMPARTMENT",
      "timestamp_utc": time.time(),
      "value": 25.5,
      "unit": "µg/m³"
      # ... other air quality fields
    }

    client.publish(MQTT_TOPIC, json.dumps(payload))
    print(f"Published message to {MQTT_TOPIC}")
    client.disconnect()
    ```
3.  **Verify:**
    - Check the MQTT Bridge service logs for "Received message..." and "Message sent to Kafka..."
    - *If a Kafka consumer is set up to write to the DB*, check the database:
      ```sql
      SELECT * FROM exposures WHERE device_id = 'AERPS-001';
      ```

---

### b. gRPC Service (NoisePro Dosimeter)

1.  **Run the Service:**
    ```bash
    cd server/grpc_service
    # Generate gRPC code if you haven't already
    # python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. noise_dosimeter.proto
    python main.py
    ```
2.  **Send Test Data:** Use the following Python client script (`test_grpc_client.py`) to call the RPC.
    ```python
    # test_grpc_client.py
    import grpc
    import noise_dosimeter_pb2
    import noise_dosimeter_pb2_grpc
    from google.protobuf.timestamp_pb2 import Timestamp

    def run():
        with grpc.insecure_channel('localhost:50051') as channel:
            stub = noise_dosimeter_pb2_grpc.NoiseDosimeterStub(channel)
            now = Timestamp()
            now.GetCurrentTime()
            response = stub.UploadNoiseData(noise_dosimeter_pb2.NoiseDataRequest(
                device_id='NOISEPRO-002',
                location_code='ENGINE_ROOM',
                timestamp_utc=now,
                captured_by='USER001',
                dosimeter_interval_min=480,
                laeq=85.5,
                peak_db=115.2
            ))
        print(f"Client received response: success={response.success}, message='{response.message}', sample_id='{response.sample_id}'")

    if __name__ == '__main__':
        run()
    ```
3.  **Verify:**
    - Check the gRPC service logs for "Received noise data upload..."
    - Check the database for the new records:
      ```sql
      SELECT * FROM exposures WHERE device_id = 'NOISEPRO-002';
      SELECT * FROM noise_details WHERE sample_id = (SELECT sample_id FROM exposures WHERE device_id = 'NOISEPRO-002');
      ```

---

### c. HL7 Listener (DOEHR-IH)

1.  **Run the Service:**
    ```bash
    cd server/hl7_listener
    python main.py
    ```
2.  **Send Test Data:** Use the following Python script (`test_hl7_sender.py`) to send a sample MLLP-wrapped HL7 message.
    ```python
    # test_hl7_sender.py
    import socket

    HOST = 'localhost'
    PORT = 2575
    # A sample ORU_R01 message
    HL7_MESSAGE = (
        b"MSH|^~\\&|SENDING_APP|SENDING_FACILITY|RECEIVING_APP|RECEIVING_FACILITY|202507171030||ORU^R01|MSG00001|P|2.5\r"
        b"PID|||PATIENT12345^^^MRN||DOE^JANE||19900101|F\r"
        b"OBR|1\r"
        b"OBX|1|NM|3141-9^LEAD^LN|1|0.005|mg/L|Normal|||F|||202507171025\r"
    )
    # MLLP framing
    MLLP_WRAPPED_MESSAGE = b'\x0b' + HL7_MESSAGE + b'\x1c\r'

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.connect((HOST, PORT))
        s.sendall(MLLP_WRAPPED_MESSAGE)
        response = s.recv(1024)
        print('Received ACK:', response)
    ```
3.  **Verify:**
    - Check the HL7 listener logs for "Received a new HL7 message."
    - Check the logs for "Successfully posted FHIR Observation..."
    - If you have a FHIR server running, verify the new `Observation` resource was created.

## 4. Testing the Backend API

Use `curl` or an API client like Postman to test the `/api/exposures` endpoint.

- **Get all exposures (first page):**
  ```bash
  curl "http://localhost:3000/api/exposures"
  ```
- **Get page 2 with a limit of 5:**
  ```bash
  curl "http://localhost:3000/api/exposures?page=2&limit=5"
  ```
- **Filter by metric type and location:**
  ```bash
  curl "http://localhost:3000/api/exposures?metric_type=noise&location_code=ENGINE_ROOM"
  ```
- **Filter by date range:**
  ```bash
  curl "http://localhost:3000/api/exposures?start_date=2025-07-17T00:00:00Z&end_date=2025-07-18T00:00:00Z"
  ```

## 5. Testing Aggregation and Alerting

1.  **Insert Test Data:** First, insert data that will meet an alert condition.
    ```sql
    -- This reading should trigger the HIGH_RADIATION alert
    INSERT INTO exposures (sample_id, device_id, location_code, timestamp_utc, captured_by, value, unit, qualifier)
    VALUES (gen_random_uuid(), 'RAD-TEST-01', 'REACTOR_COMP', NOW(), 'TESTER', 3.5, 'mrem', 'OK');
    ```
2.  **Verify Aggregates:** Check the continuous aggregate views.
    ```sql
    -- Note: It may take time for the aggregate to automatically refresh.
    SELECT * FROM hourly_heat_stress_summary;
    ```
3.  **Verify Alerting Function:** Call the function in `psql` to see if it detects the alert condition.
    ```sql
    -- Check for alerts in the last hour
    SELECT * FROM check_for_alerts(NOW() - INTERVAL '1 hour', NOW());
    ```
    You should see a row returned for the `HIGH_RADIATION` alert.

## 6. Testing Frontend Dashboards

After logging into the application, navigate to the following routes to test the new UI dashboards.

### a. Heatmap Dashboard (`/heatmap-dashboard`)

1.  **Navigate:** Go to the `/heatmap-dashboard` URL.
2.  **Interact with Filters:**
    - Change the "Metric Type", "Location", and "Date" filters.
3.  **Verify:**
    - After each filter change, the heatmap should reload.
    - A loading indicator should appear while data is being fetched.
    - If no data is available, an appropriate message should be displayed.
    - The heatmap should render over the deck plan placeholder image.

### b. Trend Chart Dashboard (`/trend-chart-dashboard`)

1.  **Navigate:** Go to the `/trend-chart-dashboard` URL.
2.  **Interact with Filters:**
    - Change the "Metric Type", "Location", and "Date Range" filters.
3.  **Verify:**
    - The line chart should update after each filter change.
    - The chart should display three distinct lines: the metric value, the upper spec limit, and the lower spec limit.
    - Hovering over data points on the chart should show a tooltip with detailed information.

### c. Data Table Dashboard (`/data-table-dashboard`)

1.  **Navigate:** Go to the `/data-table-dashboard` URL.
2.  **Interact with the Table:**
    - **Filtering:** Use the filters at the top and click "Apply Filters". The table data should update.
    - **Sorting:** Click on the table headers (e.g., "Timestamp", "Value"). The data on the current page should sort accordingly.
    - **Pagination:** Use the "Next" and "Previous" buttons to navigate through pages of data.
3.  **Test PDF Export:**
    - Click the "Export to PDF" button.
4.  **Verify:**
    - A PDF file named `exposure_report_[date].pdf` should be downloaded by your browser.
    - The PDF should contain a table with the data currently visible in the dashboard.

```