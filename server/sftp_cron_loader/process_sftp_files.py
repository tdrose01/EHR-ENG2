import os
import logging
import pysftp
import pandas as pd
import psycopg2
from dotenv import load_dotenv
from io import StringIO
import uuid

# --- Load Configuration ---
load_dotenv()

# SFTP Config
SFTP_HOST = os.getenv("SFTP_HOST")
SFTP_PORT = int(os.getenv("SFTP_PORT", 22))
SFTP_USER = os.getenv("SFTP_USER")
SFTP_PASSWORD = os.getenv("SFTP_PASSWORD")
SFTP_REMOTE_DIR = os.getenv("SFTP_REMOTE_DIR")

# DB Config
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

# Logging Config
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()

# --- Logging Setup ---
logging.basicConfig(level=LOG_LEVEL, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def get_db_connection():
    """Establishes and returns a connection to the PostgreSQL database."""
    try:
        conn = psycopg2.connect(
            host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD
        )
        logger.info("Successfully connected to the database.")
        return conn
    except psycopg2.OperationalError as e:
        logger.error(f"Could not connect to the database: {e}")
        return None

def process_files_from_sftp():
    """
    Connects to an SFTP server, processes all CSV files in a directory,
    and inserts the data into the database.
    """
    cnopts = pysftp.CnOpts()
    cnopts.hostkeys = None  # Disable host key checking for simplicity; use known_hosts in production

    db_conn = get_db_connection()
    if not db_conn:
        return

    try:
        with pysftp.Connection(
            host=SFTP_HOST, username=SFTP_USER, password=SFTP_PASSWORD, port=SFTP_PORT, cnopts=cnopts
        ) as sftp:
            logger.info(f"Successfully connected to SFTP server at {SFTP_HOST}.")
            
            files = sftp.listdir(SFTP_REMOTE_DIR)
            csv_files = [f for f in files if f.lower().endswith('.csv')]
            
            if not csv_files:
                logger.info("No new CSV files found to process.")
                return

            logger.info(f"Found {len(csv_files)} CSV files to process.")

            for filename in csv_files:
                remote_path = f"{SFTP_REMOTE_DIR}/{filename}"
                logger.info(f"Processing file: {filename}")
                
                # Download file to an in-memory buffer
                file_buffer = StringIO()
                sftp.getfo(remote_path, file_buffer)
                file_buffer.seek(0) # Rewind buffer to the beginning

                try:
                    df = pd.read_csv(file_buffer)
                    
                    # This is a generic loader. We'd need a way to determine which
                    # detail table to insert into. For this example, we'll assume
                    # the CSV is for 'Potable Water' and has the required columns.
                    # A real implementation might use filename conventions or a manifest file.
                    
                    with db_conn.cursor() as cur:
                        for index, row in df.iterrows():
                            sample_id = str(uuid.uuid4())
                            
                            # Insert into generic exposures table
                            cur.execute(
                                """
                                INSERT INTO exposures (sample_id, device_id, location_code, timestamp_utc, captured_by, value, unit, qualifier)
                                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                                """,
                                (
                                    sample_id, row['device_id'], row['location_code'], row['timestamp_utc'],
                                    row['captured_by'], row['value'], row['unit'], row['qualifier']
                                )
                            )
                            
                            # Insert into water-specific details table
                            cur.execute(
                                """
                                INSERT INTO water_details (sample_id, sample_type, temp_c, residual_chlorine_mg_l)
                                VALUES (%s, %s, %s, %s)
                                """,
                                (
                                    sample_id, row['sample_type'], row['temp_c'], row['residual_chlorine_mg_l']
                                )
                            )
                    
                    db_conn.commit()
                    logger.info(f"Successfully inserted {len(df)} records from {filename}.")
                    
                    # Remove the file from SFTP server after successful processing
                    sftp.remove(remote_path)
                    logger.info(f"Removed processed file: {filename}")

                except (pd.errors.ParserError, KeyError) as e:
                    logger.error(f"Failed to parse or process {filename}. Error: {e}. Skipping file.")
                    db_conn.rollback()
                except Exception as e:
                    logger.error(f"An unexpected error occurred while processing {filename}: {e}")
                    db_conn.rollback()

    except Exception as e:
        logger.critical(f"Failed to connect or interact with SFTP server: {e}")
    finally:
        if db_conn:
            db_conn.close()
            logger.info("Database connection closed.")


if __name__ == "__main__":
    logger.info("Starting SFTP cron loader script...")
    process_files_from_sftp()
    logger.info("SFTP cron loader script finished.")
