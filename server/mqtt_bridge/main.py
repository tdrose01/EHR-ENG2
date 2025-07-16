import os
import logging
import json
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from paho.mqtt import client as mqtt_client
from kafka import KafkaProducer
from kafka.errors import NoBrokersAvailable
import asyncio

# --- Load Configuration ---
load_dotenv()

# MQTT settings
MQTT_BROKER_HOST = os.getenv("MQTT_BROKER_HOST", "localhost")
MQTT_BROKER_PORT = int(os.getenv("MQTT_BROKER_PORT", 1883))
MQTT_TOPIC = os.getenv("MQTT_TOPIC", "sensors/aerps")

# Kafka settings
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092").split(',')
KAFKA_TOPIC = os.getenv("KAFKA_TOPIC", "environmental_exposures")

# Logging settings
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()

# --- Logging Setup ---
logging.basicConfig(level=LOG_LEVEL, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- FastAPI App ---
app = FastAPI(
    title="AERPS Sensor MQTT Bridge",
    description="A service to receive sensor data from MQTT and forward it to Kafka.",
    version="1.0.0"
)

# --- Kafka Producer ---
kafka_producer = None

def get_kafka_producer():
    """Initializes and returns a Kafka producer."""
    global kafka_producer
    if kafka_producer is None:
        try:
            kafka_producer = KafkaProducer(
                bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
                value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                api_version=(0, 10, 2) # Specify a compatible API version
            )
            logger.info(f"Successfully connected to Kafka at {KAFKA_BOOTSTRAP_SERVERS}")
        except NoBrokersAvailable:
            logger.error(f"Could not connect to Kafka brokers at {KAFKA_BOOTSTRAP_SERVERS}. Please ensure Kafka is running.")
            raise
    return kafka_producer

# --- MQTT Client ---
def connect_mqtt() -> mqtt_client.Client:
    """Connects to the MQTT broker."""
    def on_connect(client, userdata, flags, rc):
        if rc == 0:
            logger.info("Successfully connected to MQTT Broker!")
            client.subscribe(MQTT_TOPIC)
            logger.info(f"Subscribed to topic: {MQTT_TOPIC}")
        else:
            logger.error(f"Failed to connect to MQTT, return code {rc}\n")

    client = mqtt_client.Client(client_id=f"mqtt_bridge_{os.getpid()}")
    client.on_connect = on_connect
    try:
        client.connect(MQTT_BROKER_HOST, MQTT_BROKER_PORT)
    except ConnectionRefusedError:
        logger.error(f"MQTT connection refused. Is the broker running at {MQTT_BROKER_HOST}:{MQTT_BROKER_PORT}?")
        raise
    return client

def on_message(client, userdata, msg):
    """Callback for when a message is received from MQTT."""
    try:
        payload = msg.payload.decode()
        logger.info(f"Received message from topic `{msg.topic}`: {payload}")
        
        # Assume payload is a JSON string
        sensor_data = json.loads(payload)

        # TODO: Add validation logic here (e.g., using Pydantic)
        # For now, we just forward it.

        producer = get_kafka_producer()
        if producer:
            producer.send(KAFKA_TOPIC, value=sensor_data)
            producer.flush()
            logger.info(f"Message sent to Kafka topic `{KAFKA_TOPIC}`")

    except json.JSONDecodeError:
        logger.error(f"Failed to decode JSON from message: {msg.payload.decode()}")
    except Exception as e:
        logger.error(f"An error occurred while processing message: {e}")

# --- FastAPI Lifecycle Events ---
@app.on_event("startup")
async def startup_event():
    """Actions to perform on application startup."""
    logger.info("Starting up MQTT Bridge...")
    try:
        # Initialize Kafka Producer
        get_kafka_producer()

        # Initialize and connect MQTT Client
        mqttc = connect_mqtt()
        mqttc.on_message = on_message
        mqttc.loop_start()
        app.state.mqtt_client = mqttc
    except (NoBrokersAvailable, ConnectionRefusedError) as e:
        logger.critical(f"Fatal error during startup: {e}. Application will not start correctly.")
        # In a real-world scenario, you might want to exit or have a retry mechanism.
        # For now, we log a critical error.
        app.state.startup_error = str(e)


@app.on_event("shutdown")
def shutdown_event():
    """Actions to perform on application shutdown."""
    logger.info("Shutting down MQTT Bridge...")
    if hasattr(app.state, 'mqtt_client'):
        app.state.mqtt_client.loop_stop()
        app.state.mqtt_client.disconnect()
    if kafka_producer:
        kafka_producer.close()

# --- API Endpoints ---
@app.get("/status", tags=["Health Check"])
async def get_status():
    """Returns the operational status of the bridge."""
    mqtt_status = "disconnected"
    if hasattr(app.state, 'mqtt_client') and app.state.mqtt_client.is_connected():
        mqtt_status = "connected"

    kafka_status = "disconnected"
    if kafka_producer and kafka_producer.bootstrap_connected():
        kafka_status = "connected"
        
    if hasattr(app.state, 'startup_error'):
         raise HTTPException(
            status_code=503, 
            detail=f"Service Unavailable: {app.state.startup_error}"
        )

    return {
        "status": "ok",
        "mqtt_status": mqtt_status,
        "kafka_status": kafka_status,
        "mqtt_broker": f"{MQTT_BROKER_HOST}:{MQTT_BROKER_PORT}",
        "mqtt_topic": MQTT_TOPIC,
        "kafka_bootstrap_servers": KAFKA_BOOTSTRAP_SERVERS,
        "kafka_topic": KAFKA_TOPIC
    }

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Uvicorn server for MQTT Bridge...")
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level=LOG_LEVEL.lower())