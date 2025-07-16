import os
import logging
import psycopg2
from dotenv import load_dotenv

# --- Load Configuration ---
load_dotenv()

# DB Config
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

# Retention Config
RAW_DATA_RETENTION_YEARS = int(os.getenv("RAW_DATA_RETENTION_YEARS", 5))
AGGREGATE_DATA_RETENTION_YEARS = int(os.getenv("AGGREGATE_DATA_RETENTION_YEARS", 10))

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
        return conn
    except psycopg2.OperationalError as e:
        logger.error(f"Could not connect to the database: {e}")
        return None

def apply_retention_policies(conn):
    """
    Deletes data from the database that is older than the defined retention periods.
    """
    try:
        with conn.cursor() as cur:
            # --- 1. Purge Raw Sensor Data ---
            # The ON DELETE CASCADE foreign key constraint will automatically clean up
            # records in the detail tables (e.g., noise_details, water_details).
            raw_cutoff_date = f"NOW() - INTERVAL '{RAW_DATA_RETENTION_YEARS} years'"
            logger.info(f"Deleting raw exposure data older than {RAW_DATA_RETENTION_YEARS} years...")
            
            raw_delete_query = f"DELETE FROM exposures WHERE timestamp_utc < {raw_cutoff_date};"
            cur.execute(raw_delete_query)
            
            deleted_raw_count = cur.rowcount
            logger.info(f"Deleted {deleted_raw_count} raw exposure records.")

            # --- 2. Purge Aggregated Data ---
            # We need to do this for each continuous aggregate view.
            agg_cutoff_date = f"NOW() - INTERVAL '{AGGREGATE_DATA_RETENTION_YEARS} years'"
            aggregate_views = [
                'hourly_air_quality_summary',
                'hourly_heat_stress_summary'
            ]

            for view_name in aggregate_views:
                logger.info(f"Deleting aggregated data from {view_name} older than {AGGREGATE_DATA_RETENTION_YEARS} years...")
                agg_delete_query = f"DELETE FROM {view_name} WHERE bucket < {agg_cutoff_date};"
                cur.execute(agg_delete_query)
                deleted_agg_count = cur.rowcount
                logger.info(f"Deleted {deleted_agg_count} aggregated records from {view_name}.")

            conn.commit()
            logger.info("Successfully applied all data retention policies.")

    except Exception as e:
        logger.error(f"An error occurred while applying retention policies: {e}")
        conn.rollback()

def run_retention_manager():
    """Main function to run the data retention process."""
    logger.info("Starting data retention policy manager...")
    conn = get_db_connection()
    if not conn:
        return

    try:
        apply_retention_policies(conn)
    finally:
        if conn:
            conn.close()
            logger.info("Database connection closed.")
    
    logger.info("Data retention policy manager finished.")

if __name__ == "__main__":
    run_retention_manager()
