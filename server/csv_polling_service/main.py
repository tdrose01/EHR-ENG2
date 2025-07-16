import os
import time
import logging
import pandas as pd
import requests
from dotenv import load_dotenv
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# --- Load Configuration ---
load_dotenv()

WATCH_DIRECTORY = os.getenv("WATCH_DIRECTORY")
NIFI_ENDPOINT_URL = os.getenv("NIFI_ENDPOINT_URL")
POLLING_INTERVAL_SECONDS = int(os.getenv("POLLING_INTERVAL_SECONDS", 10))
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()

# --- Logging Setup ---
logging.basicConfig(level=LOG_LEVEL, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Input Validation ---
if not WATCH_DIRECTORY or not os.path.isdir(WATCH_DIRECTORY):
    logger.critical(f"Watch directory '{WATCH_DIRECTORY}' is not valid or does not exist. Please check your .env file.")
    exit(1)
if not NIFI_ENDPOINT_URL:
    logger.critical("NIFI_ENDPOINT_URL is not set. Please check your .env file.")
    exit(1)

class CSVHandler(FileSystemEventHandler):
    """Handles file system events for new CSV files."""

    def on_created(self, event):
        """
        Called when a file or directory is created.
        """
        if not event.is_directory and event.src_path.endswith('.csv'):
            logger.info(f"New CSV file detected: {event.src_path}")
            self.process_csv(event.src_path)

    def process_csv(self, file_path):
        """
        Reads a CSV file and sends its content to the NiFi endpoint.
        """
        try:
            # Wait a moment to ensure the file is fully written
            time.sleep(1)
            
            df = pd.read_csv(file_path)
            
            # Convert dataframe to JSON records
            data_json = df.to_json(orient='records')
            
            logger.info(f"Successfully parsed {len(df)} records from {os.path.basename(file_path)}.")
            
            self.send_to_nifi(data_json, os.path.basename(file_path))

        except pd.errors.EmptyDataError:
            logger.warning(f"CSV file is empty: {file_path}")
        except Exception as e:
            logger.error(f"Failed to process file {file_path}: {e}")

    def send_to_nifi(self, data, filename):
        """
        Sends data as a POST request to the NiFi endpoint.
        """
        headers = {
            'Content-Type': 'application/json',
            'X-Filename': filename  # Custom header to pass original filename
        }
        try:
            response = requests.post(NIFI_ENDPOINT_URL, data=data, headers=headers, timeout=30)
            response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)
            
            logger.info(f"Successfully sent data from {filename} to NiFi. Status: {response.status_code}")
            
            # Optional: Move or delete the file after successful processing
            # os.remove(file_path)

        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to send data to NiFi: {e}")


def start_polling():
    """Starts the file system observer."""
    event_handler = CSVHandler()
    observer = Observer()
    observer.schedule(event_handler, WATCH_DIRECTORY, recursive=False)
    
    logger.info(f"Starting CSV polling service. Watching directory: {WATCH_DIRECTORY}")
    logger.info(f"NiFi Endpoint: {NIFI_ENDPOINT_URL}")
    
    observer.start()
    
    try:
        while True:
            time.sleep(POLLING_INTERVAL_SECONDS)
    except KeyboardInterrupt:
        observer.stop()
        logger.info("Polling service stopped by user.")
    
    observer.join()


if __name__ == "__main__":
    start_polling()
