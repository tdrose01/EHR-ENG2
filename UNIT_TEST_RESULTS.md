# Unit Test Results

This document tracks the progress and results of the unit tests for the new features.

## Backend API

- [x] **`GET /api/exposures`**:
  - [x] Returns a 200 status code on success.
  - [x] Returns a paginated list of exposure records.
  - [x] Correctly applies filtering by `metric_type`.
  - [x] Correctly applies filtering by `location_code`.
  - [x] Correctly applies filtering by date range.
  - [x] Handles errors gracefully.

## Frontend Components

- [x] **`HeatmapDashboard.vue`**:
  - [x] Renders correctly with initial data.
  - [x] Fetches new data when filters are changed.
  - [x] Displays a loading state while fetching.
  - [x] Displays an error message on API failure.

- [x] **`TrendChartDashboard.vue`**:
  - [x] Renders the line chart correctly.
  - [x] Includes datasets for metric value, upper limit, and lower limit.
  - [x] Fetches new data when filters are changed.
  - [x] Displays a loading state and handles errors.

- [x] **`DataTableDashboard.vue`**:
  - [x] Renders correctly with initial data.
  - [x] Fetches new data when filters are applied.
  - [x] Displays a loading state while fetching.
  - [x] Displays an error message on API failure.
  - [x] Pagination controls work correctly.
  - [x] Client-side sorting functions correctly.
  - [x] PDF export function can be called without errors.

## Python Microservices

- [x] **gRPC Service (`server/grpc_service`)**:
  - [x] Successfully inserts valid noise data into the database.
  - [x] Rejects data with an expired calibration date.
  - [x] Handles database connection errors gracefully.

- [x] **Anomaly Detection Service (`server/anomaly_detection_service`)**:
  - [x] Correctly identifies records with a Z-score > 3.
  - [x] Flags identified anomalies by updating the `qualifier` to `PENDING`.
  - [x] Does not flag data with a Z-score <= 3.

- [x] **Data Retention Service (`server/data_retention_service`)**:
  - [x] Correctly deletes raw exposure data older than the retention period.
  - [x] Correctly deletes aggregated data older than the retention period.

---
*This document will be updated as tests are written and executed.*
