-- This script sets up TimescaleDB continuous aggregates for data summarization
-- and an alerting function to check for threshold breaches.

-- Ensure the TimescaleDB extension is enabled.
-- You must run this command as a superuser on your database first:
-- CREATE EXTENSION IF NOT EXISTS timescaledb;

-- 1. Turn the 'exposures' table into a TimescaleDB hypertable
-- This is necessary for creating continuous aggregates.
-- The table is partitioned by the 'timestamp_utc' column.
SELECT create_hypertable('exposures', 'timestamp_utc');

-- 2. Create Continuous Aggregates for hourly summaries
-- This will automatically calculate the average, max, and min values for each
-- device and location every hour, making dashboard queries much faster.

-- Example for Air Quality (PM2.5)
CREATE MATERIALIZED VIEW hourly_air_quality_summary
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 hour', timestamp_utc) AS bucket,
    device_id,
    location_code,
    AVG(value) as avg_pm25,
    MAX(value) as max_pm25,
    MIN(value) as min_pm25,
    COUNT(*) as num_readings
FROM exposures
WHERE unit = 'µg/m³' -- Assuming this unit is specific to PM2.5/PM10
GROUP BY bucket, device_id, location_code;

-- Example for Heat Stress (WBGT)
CREATE MATERIALIZED VIEW hourly_heat_stress_summary
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 hour', timestamp_utc) AS bucket,
    device_id,
    location_code,
    AVG(value) as avg_wbgt,
    MAX(value) as max_wbgt,
    MIN(value) as min_wbgt,
    COUNT(*) as num_readings
FROM exposures
WHERE unit = '°C' -- Assuming this unit is for WBGT
GROUP BY bucket, device_id, location_code;

-- Add policies to automatically refresh the continuous aggregates
SELECT add_continuous_aggregate_policy('hourly_air_quality_summary',
    start_offset => INTERVAL '3 hours',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour');

SELECT add_continuous_aggregate_policy('hourly_heat_stress_summary',
    start_offset => INTERVAL '3 hours',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour');


-- 3. Create an Alerting Function
-- This PostgreSQL function checks for specific alert conditions over a given time range.
-- It can be called by a scheduled job (e.g., a cron job running a script) every few minutes.

CREATE OR REPLACE FUNCTION check_for_alerts(
    time_range_start TIMESTAMPTZ,
    time_range_end TIMESTAMPTZ
)
RETURNS TABLE(alert_type TEXT, location_code TEXT, trigger_value NUMERIC, alert_time TIMESTAMPTZ) AS $$
BEGIN
    -- Alert 1: PM2.5 > 35 µg/m³ for 1 hour
    RETURN QUERY
    SELECT
        'HIGH_PM2.5' AS alert_type,
        s.location_code,
        s.avg_pm25 AS trigger_value,
        s.bucket AS alert_time
    FROM hourly_air_quality_summary s
    WHERE
        s.bucket >= time_range_start AND s.bucket < time_range_end
        AND s.avg_pm25 > 35.0;

    -- Alert 2: WBGT > 32 °C for 30 minutes (using hourly average as a proxy)
    -- A more precise implementation might require a 30-min aggregate view.
    RETURN QUERY
    SELECT
        'HIGH_HEAT_STRESS' AS alert_type,
        s.location_code,
        s.avg_wbgt AS trigger_value,
        s.bucket AS alert_time
    FROM hourly_heat_stress_summary s
    WHERE
        s.bucket >= time_range_start AND s.bucket < time_range_end
        AND s.avg_wbgt > 32.0;

    -- Alert 3: Radiation dose rate > 2 mrem/hr
    -- This checks for any single reading that is too high.
    RETURN QUERY
    SELECT
        'HIGH_RADIATION' AS alert_type,
        e.location_code,
        e.value AS trigger_value,
        e.timestamp_utc AS alert_time
    FROM exposures e
    WHERE
        e.timestamp_utc >= time_range_start AND e.timestamp_utc < time_range_end
        AND e.unit = 'mrem' AND e.value > 2.0;

END;
$$ LANGUAGE plpgsql;

-- Example of how to call the function:
-- SELECT * FROM check_for_alerts(NOW() - INTERVAL '1 hour', NOW());
