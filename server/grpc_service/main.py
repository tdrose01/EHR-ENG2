import os
import logging
import grpc
import psycopg2
from concurrent import futures
from dotenv import load_dotenv
import uuid

# Import generated classes
import noise_dosimeter_pb2
import noise_dosimeter_pb2_grpc

# --- Load Configuration ---
load_dotenv()

GRPC_SERVER_PORT = os.getenv("GRPC_SERVER_PORT", "50051")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()

# Database connection details
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

# --- Logging Setup ---
logging.basicConfig(level=LOG_LEVEL, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Database Connection ---
def get_db_connection():
    """Establishes and returns a connection to the PostgreSQL database."""
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        logger.info("Successfully connected to the database.")
        return conn
    except psycopg2.OperationalError as e:
        logger.error(f"Could not connect to the database: {e}")
        return None

from datetime import datetime, timedelta

# ... (rest of the imports)

# --- Service Implementation ---
class NoiseDosimeterServicer(noise_dosimeter_pb2_grpc.NoiseDosimeterServicer):
    """Provides methods that implement functionality of the noise dosimeter server."""

    def UploadNoiseData(self, request, context):
        """
        Receives noise data, validates it, inserts it into the database, 
        and returns a confirmation.
        """
        logger.info(f"Received noise data upload for device: {request.device_id}")

        # --- Calibration Enforcement Rule ---
        if request.HasField('calibration_date'):
            calibration_dt = request.calibration_date.ToDatetime()
            if datetime.utcnow() - calibration_dt > timedelta(days=180):
                error_message = f"Device calibration is expired. Last calibration was on {calibration_dt.date()}."
                logger.warning(f"Rejecting data for device {request.device_id}: {error_message}")
                context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
                context.set_details(error_message)
                return noise_dosimeter_pb2.NoiseDataResponse(success=False, message=error_message)
        else:
            logger.warning(f"No calibration_date provided for device {request.device_id}. Allowing for now, but this should be enforced.")

        conn = get_db_connection()
        if not conn:
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details("Database connection failed.")
            return noise_dosimeter_pb2.NoiseDataResponse(success=False, message="Database connection failed.")

        sample_id = str(uuid.uuid4())
        
        try:
            with conn.cursor() as cur:
                # Insert into generic exposures table
                cur.execute(
                    """
                    INSERT INTO exposures (sample_id, device_id, location_code, timestamp_utc, captured_by, value, unit, qualifier)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        sample_id,
                        request.device_id,
                        request.location_code,
                        request.timestamp_utc.ToDatetime(),
                        request.captured_by,
                        request.laeq, # Using LAeq as the primary 'value'
                        'dBA',      # Standard unit for LAeq
                        'OK'        # Default qualifier
                    )
                )

                # Insert into noise-specific details table
                cur.execute(
                    """
                    INSERT INTO noise_details (sample_id, dosimeter_interval_min, laeq, peak_db)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (
                        sample_id,
                        request.dosimeter_interval_min,
                        request.laeq,
                        request.peak_db
                    )
                )
                
                conn.commit()
                logger.info(f"Successfully inserted noise data with sample_id: {sample_id}")
                
                return noise_dosimeter_pb2.NoiseDataResponse(
                    success=True,
                    message="Noise data successfully uploaded.",
                    sample_id=sample_id
                )

        except Exception as e:
            logger.error(f"Failed to insert data into database: {e}")
            if conn:
                conn.rollback()
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Database insert failed: {e}")
            return noise_dosimeter_pb2.NoiseDataResponse(success=False, message=f"Database insert failed: {e}")
        finally:
            if conn:
                conn.close()

# --- Server Setup ---
def serve():
    """Starts the gRPC server."""
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    noise_dosimeter_pb2_grpc.add_NoiseDosimeterServicer_to_server(
        NoiseDosimeterServicer(), server
    )
    server.add_insecure_port(f'[::]:{GRPC_SERVER_PORT}')
    
    logger.info(f"Starting gRPC server on port {GRPC_SERVER_PORT}...")
    server.start()
    
    try:
        server.wait_for_termination()
    except KeyboardInterrupt:
        logger.info("gRPC server stopped by user.")
        server.stop(0)

if __name__ == '__main__':
    # Before running, ensure you have generated the gRPC code:
    # python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. noise_dosimeter.proto
    serve()
