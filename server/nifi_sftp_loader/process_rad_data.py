import json
import uuid
from org.apache.nifi.processor.io import StreamCallback

class PyStreamCallback(StreamCallback):
    def __init__(self):
        pass

    def process(self, inputStream, outputStream):
        # Generate a unique sample_id for this record
        sample_id = str(uuid.uuid4())

        # Read attributes from the FlowFile
        device_id = flowFile.getAttribute('device_id')
        location_code = flowFile.getAttribute('location_code')
        timestamp_utc = flowFile.getAttribute('timestamp_utc')
        captured_by = flowFile.getAttribute('captured_by')
        detector_type = flowFile.getAttribute('detector_type')
        shielding_cm = flowFile.getAttribute('shielding_cm')
        calibration_date = flowFile.getAttribute('calibration_date')
        gamma_dose = flowFile.getAttribute('gamma_dose')
        unit = flowFile.getAttribute('unit')

        # Basic validation
        if not all([device_id, location_code, timestamp_utc, gamma_dose, unit]):
            # You can route to a failure relationship in NiFi if needed
            # For now, we just log and write an empty output
            # log.error("Missing required fields in FlowFile attributes.")
            return

        # --- SQL Statement Generation ---
        
        # SQL for the 'exposures' table
        sql_exposures = (
            "INSERT INTO exposures (sample_id, device_id, location_code, timestamp_utc, captured_by, value, unit, qualifier) "
            "VALUES ('{}', '{}', '{}', '{}', '{}', {}, '{}', 'OK');"
        ).format(
            sample_id,
            device_id,
            location_code,
            timestamp_utc,
            captured_by,
            float(gamma_dose),
            unit
        )

        # SQL for the 'radiation_details' table
        sql_radiation_details = (
            "INSERT INTO radiation_details (sample_id, detector_type, shielding_cm, calibration_date) "
            "VALUES ('{}', '{}', {}, '{}');"
        ).format(
            sample_id,
            detector_type,
            float(shielding_cm) if shielding_cm else 'NULL',
            calibration_date if calibration_date else 'NULL'
        )

        # Combine the SQL statements. The PutDatabaseRecord processor can handle multiple statements.
        combined_sql = sql_exposures + "\n" + sql_radiation_details

        # Write the combined SQL to the FlowFile content
        outputStream.write(combined_sql.encode('utf-8'))

# Instantiate the callback and process the flowfile
flowFile = session.get()
if flowFile is not None:
    flowFile = session.write(flowFile, PyStreamCallback())
    # Route to success
    session.transfer(flowFile, REL_SUCCESS)
    session.commit()
