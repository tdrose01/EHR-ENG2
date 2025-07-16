import os
import logging
import pandas as pd
import numpy as np
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

# Anomaly Detection Config
LOOKBACK_HOURS = int(os.getenv("LOOKBACK_HOURS", 24))
Z_SCORE_THRESHOLD = float(os.getenv("Z_SCORE_THRESHOLD", 3.0))

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

def fetch_recent_exposures(conn):
    """Fetches recent exposure data that has not been flagged yet."""
    query = """
        SELECT sample_id, value, unit
        FROM exposures
        WHERE timestamp_utc >= NOW() - INTERVAL '%s hours'
        AND qualifier = 'OK'
    """
    try:
        df = pd.read_sql_query(query, conn, params=(LOOKBACK_HOURS,))
        logger.info(f"Fetched {len(df)} recent exposure records for analysis.")
        return df
    except Exception as e:
        logger.error(f"Failed to fetch data from database: {e}")
        return pd.DataFrame()

def flag_anomalies(conn, anomaly_ids):
    """Updates the qualifier for a list of sample_ids to 'PENDING'."""
    if not anomaly_ids:
        return 0
    
    query = "UPDATE exposures SET qualifier = 'PENDING' WHERE sample_id = ANY(%s)"
    try:
        with conn.cursor() as cur:
            cur.execute(query, (anomaly_ids,))
            conn.commit()
            logger.info(f"Successfully flagged {len(anomaly_ids)} records as 'PENDING'.")
            return len(anomaly_ids)
    except Exception as e:
        logger.error(f"Failed to flag anomalies in the database: {e}")
        conn.rollback()
        return 0

def run_anomaly_detection():
    """Main function to run the anomaly detection process."""
    logger.info("Starting anomaly detection process...")
    conn = get_db_connection()
    if not conn:
        return

    try:
        df = fetch_recent_exposures(conn)
        if df.empty:
            logger.info("No new records to process.")
            return

        # Group by metric unit to analyze similar measurements together
        grouped = df.groupby('unit')
        all_anomaly_ids = []

        for unit, group in grouped:
            if len(group) < 2:
                # Need at least 2 data points to calculate standard deviation
                continue

            mean_val = group['value'].mean()
            std_dev = group['value'].std()

            # Avoid division by zero if all values in the group are the same
            if std_dev == 0:
                continue

            # Calculate Z-score for each record in the group
            z_scores = group['value'].apply(lambda x: abs((x - mean_val) / std_dev))
            
            # Identify anomalies
            anomalies = group[z_scores > Z_SCORE_THRESHOLD]
            
            if not anomalies.empty:
                logger.warning(f"Found {len(anomalies)} anomalies for unit '{unit}'.")
                all_anomaly_ids.extend(anomalies['sample_id'].tolist())

        if all_anomaly_ids:
            flag_anomalies(conn, all_anomaly_ids)
        else:
            logger.info("No anomalies found in this run.")

    finally:
        if conn:
            conn.close()
            logger.info("Database connection closed.")
    
    logger.info("Anomaly detection process finished.")

if __name__ == "__main__":
    run_anomaly_detection()
