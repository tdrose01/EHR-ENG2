# NiFi Flow Plan: SAMS RAD-1 CSV Batch Loader (SFTP)

This document outlines the NiFi flow required to fetch CSV files containing radiation data from an SFTP server, process the data, and insert it into the PostgreSQL database.

## Flow Overview

The flow consists of the following processors chained together:

`GetSFTP` -> `SplitText` -> `UpdateAttribute` -> `ExecuteScript` -> `PutDatabaseRecord`

---

### 1. Processor: `GetSFTP`

- **Purpose:** Polls a directory on an SFTP server and retrieves new files.
- **Configuration:**
  - **Hostname:** Your SFTP server's address.
  - **Port:** `22`
  - **Username:** Your SFTP username.
  - **Password/Private Key:** Your SFTP credentials.
  - **Remote Path:** The directory on the SFTP server where the RAD-1 CSV files are exported (e.g., `/exports/rad1`).
  - **Completion Strategy:** `Move File` (to prevent re-processing).
  - **Move Destination Directory:** A directory on the SFTP server for processed files (e.g., `/exports/rad1/processed`).
  - **Search Recursively:** `false`.

---

### 2. Processor: `SplitText`

- **Purpose:** Splits the incoming CSV file into individual lines (one record per FlowFile). This allows for parallel processing and better error handling.
- **Configuration:**
  - **Line Split Count:** `1`
  - **Header Line Count:** `1` (if the CSV has a header).
  - **Remove Trailing Newlines:** `true`.

---

### 3. Processor: `UpdateAttribute`

- **Purpose:** Extracts the CSV data into FlowFile attributes, making it easier to work with in the `ExecuteScript` processor.
- **Configuration:**
  - Add a new property for each column in the CSV. Assuming the CSV format is: `device_id,location_code,timestamp_utc,captured_by,detector_type,shielding_cm,calibration_date,gamma_dose,unit`
  - **`device_id`**: `${csv.line:getDelimitedField(1)}`
  - **`location_code`**: `${csv.line:getDelimitedField(2)}`
  - **`timestamp_utc`**: `${csv.line:getDelimitedField(3)}`
  - **`captured_by`**: `${csv.line:getDelimitedField(4)}`
  - **`detector_type`**: `${csv.line:getDelimitedField(5)}`
  - **`shielding_cm`**: `${csv.line:getDelimitedField(6)}`
  - **`calibration_date`**: `${csv.line:getDelimitedField(7)}`
  - **`gamma_dose`**: `${csv.line:getDelimitedFiel(8)}`
  - **`unit`**: `${csv.line:getDelimitedField(9)}`

---

### 4. Processor: `ExecuteScript`

- **Purpose:** Runs a custom Python script to transform the data from the attributes into a structured format (JSON) and prepare it for database insertion.
- **Configuration:**
  - **Script Engine:** `python`
  - **Script Body:** Paste the content of the `process_rad_data.py` script here.
  - **Module Directory:** If you have external Python libraries, specify the path here. For this script, no external modules are needed beyond the standard library.

---

### 5. Processor: `PutDatabaseRecord`

- **Purpose:** Inserts the processed data into the PostgreSQL database.
- **Configuration:**
  - **Record Reader:** Create a new `JsonTreeReader`.
  - **Statement Type:** `INSERT`
  - **Database Connection Pooling Service:** Create a new `DBCPConnectionPool` and configure it with your PostgreSQL connection details (JDBC URL, username, password).
  - **Schema Name:** `public`
  - **Table Name:** `exposures` (This will be handled by the SQL in the script's output).
  - **Translate Field Names:** `true`.
  - This processor will execute two separate `INSERT` statements, one for `exposures` and one for `radiation_details`, which will be passed in the FlowFile content by the `ExecuteScript` processor.
