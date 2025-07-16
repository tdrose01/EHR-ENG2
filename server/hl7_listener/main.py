import os
import socket
import logging
import requests
from dotenv import load_dotenv
from hl7apy import parser
from hl7apy.mllp import MLLPServer, MLLPHandler
from hl7apy.exceptions import HL7apyException

# --- Load Configuration ---
load_dotenv()

LISTENER_HOST = os.getenv("LISTENER_HOST", "0.0.0.0")
LISTENER_PORT = int(os.getenv("LISTENER_PORT", 2575))
FHIR_SERVER_ENDPOINT = os.getenv("FHIR_SERVER_ENDPOINT")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()

# --- Logging Setup ---
logging.basicConfig(level=LOG_LEVEL, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Input Validation ---
if not FHIR_SERVER_ENDPOINT:
    logger.critical("FHIR_SERVER_ENDPOINT is not set. Please check your .env file.")
    exit(1)

def map_hl7_to_fhir(hl7_message):
    """
    Parses an HL7 ORU_R01 message and maps the first OBX segment to a FHIR Observation resource.
    This is a simplified example. A real-world implementation would be more robust.
    """
    try:
        # Assuming the message is an ORU_R01 message with observation results
        patient_id = hl7_message.ORU_R01_PATIENT_RESULT.ORU_R01_PATIENT.PID.pid_3.cx_1.value
        observation_code = hl7_message.ORU_R01_PATIENT_RESULT.ORU_R01_ORDER_OBSERVATION.OBX.obx_3.ce_1.value
        observation_text = hl7_message.ORU_R01_PATIENT_RESULT.ORU_R01_ORDER_OBSERVATION.OBX.obx_3.ce_2.value
        observation_value = hl7_message.ORU_R01_PATIENT_RESULT.ORU_R01_ORDER_OBSERVATION.OBX.obx_5.value
        observation_unit = hl7_message.ORU_R01_PATIENT_RESULT.ORU_R01_ORDER_OBSERVATION.OBX.obx_6.ce_1.value
        effective_datetime = hl7_message.ORU_R01_PATIENT_RESULT.ORU_R01_ORDER_OBSERVATION.OBX.obx_14.ts_1.value

        fhir_observation = {
            "resourceType": "Observation",
            "status": "final",
            "code": {
                "coding": [{
                    "system": "http://loinc.org", # Assuming LOINC for this example
                    "code": observation_code,
                    "display": observation_text
                }],
                "text": observation_text
            },
            "subject": {
                "reference": f"Patient/{patient_id}"
            },
            "effectiveDateTime": effective_datetime,
            "valueQuantity": {
                "value": float(observation_value),
                "unit": observation_unit,
                "system": "http://unitsofmeasure.org"
            }
        }
        return fhir_observation
    except (AttributeError, ValueError) as e:
        logger.error(f"Failed to map HL7 to FHIR. Missing required fields or invalid data. Error: {e}")
        return None

def post_to_fhir_server(fhir_resource):
    """
    Posts a FHIR resource to the configured FHIR server endpoint.
    """
    try:
        headers = {'Content-Type': 'application/fhir+json'}
        response = requests.post(FHIR_SERVER_ENDPOINT, json=fhir_resource, headers=headers, timeout=15)
        response.raise_for_status()
        logger.info(f"Successfully posted FHIR Observation to {FHIR_SERVER_ENDPOINT}. Response: {response.json()}")
        return True
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to post FHIR resource: {e}")
        return False

class MyHandler(MLLPHandler):
    """
    Custom handler for incoming HL7 messages.
    """
    def handle(self, message):
        """
        This method is called when a message is received.
        It parses the message, maps it to FHIR, posts it, and returns an ACK.
        """
        logger.info("Received a new HL7 message.")
        try:
            # Parse the message
            parsed_message = parser.parse_message(message.decode(), find_groups=False)
            logger.debug(f"Parsed message: {parsed_message.to_er7()}")

            # Map to FHIR
            fhir_observation = map_hl7_to_fhir(parsed_message)
            
            if fhir_observation:
                # Post to FHIR server
                success = post_to_fhir_server(fhir_observation)
                if success:
                    # Create a positive acknowledgement (ACK)
                    ack = parsed_message.create_ack(ack_type='AA')
                else:
                    # Create a negative acknowledgement (AE - Application Error)
                    ack = parsed_message.create_ack(ack_type='AE', error_message="Failed to post to FHIR server.")
            else:
                ack = parsed_message.create_ack(ack_type='AE', error_message="Failed to map HL7 to FHIR.")

            return ack.to_mllp()

        except HL7apyException as e:
            logger.error(f"Failed to parse HL7 message: {e}")
            # Return a basic error ACK if parsing fails
            return b'\x0bMSH|^~\\&|||||...||ACK^A01|...|P|2.5\rMSA|AE|...\r\x1c\r'


def run_server():
    """
    Starts the MLLP server.
    """
    try:
        server = MLLPServer(LISTENER_HOST, LISTENER_PORT, MyHandler)
        logger.info(f"Starting HL7 MLLP listener on {LISTENER_HOST}:{LISTENER_PORT}")
        server.serve_forever()
    except Exception as e:
        logger.critical(f"Failed to start MLLP server: {e}")

if __name__ == "__main__":
    run_server()
