-- Migration: Add Real-time Database Triggers
-- Description: Creates triggers and functions for real-time updates via pg_notify
-- Date: 2025-01-XX

-- Function to notify about dose reading changes
CREATE OR REPLACE FUNCTION notify_dose_reading_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Send notification via pg_notify
  PERFORM pg_notify(
    'dose_reading_changes',
    json_build_object(
      'operation', TG_OP,
      'record_id', COALESCE(NEW.id, OLD.id),
      'timestamp', NOW()
    )::text
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to notify about alert changes
CREATE OR REPLACE FUNCTION notify_alert_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'alert_changes',
    json_build_object(
      'operation', TG_OP,
      'record_id', COALESCE(NEW.id, OLD.id),
      'timestamp', NOW()
    )::text
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to notify about personnel changes
CREATE OR REPLACE FUNCTION notify_personnel_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'personnel_changes',
    json_build_object(
      'operation', TG_OP,
      'record_id', COALESCE(NEW.id, OLD.id),
      'timestamp', NOW()
    )::text
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to notify about device changes
CREATE OR REPLACE FUNCTION notify_device_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'device_changes',
    json_build_object(
      'operation', TG_OP,
      'record_id', COALESCE(NEW.id, OLD.id),
      'timestamp', NOW()
    )::text
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for radiation_dose_readings table
DROP TRIGGER IF EXISTS dose_reading_notify_trigger ON radiation_dose_readings;
CREATE TRIGGER dose_reading_notify_trigger
  AFTER INSERT OR UPDATE OR DELETE ON radiation_dose_readings
  FOR EACH ROW EXECUTE FUNCTION notify_dose_reading_change();

-- Create triggers for radiation_alerts table
DROP TRIGGER IF EXISTS alert_notify_trigger ON radiation_alerts;
CREATE TRIGGER alert_notify_trigger
  AFTER INSERT OR UPDATE OR DELETE ON radiation_alerts
  FOR EACH ROW EXECUTE FUNCTION notify_alert_change();

-- Create triggers for radiation_personnel table
DROP TRIGGER IF EXISTS personnel_notify_trigger ON radiation_personnel;
CREATE TRIGGER personnel_notify_trigger
  AFTER INSERT OR UPDATE OR DELETE ON radiation_personnel
  FOR EACH ROW EXECUTE FUNCTION notify_personnel_change();

-- Create triggers for radiation_devices table
DROP TRIGGER IF EXISTS device_notify_trigger ON radiation_devices;
CREATE TRIGGER device_notify_trigger
  AFTER INSERT OR UPDATE OR DELETE ON radiation_devices
  FOR EACH ROW EXECUTE FUNCTION notify_device_change();

-- Add comment to document the triggers
COMMENT ON FUNCTION notify_dose_reading_change() IS 'Notifies about changes to dose readings for real-time updates';
COMMENT ON FUNCTION notify_alert_change() IS 'Notifies about changes to alerts for real-time updates';
COMMENT ON FUNCTION notify_personnel_change() IS 'Notifies about changes to personnel for real-time updates';
COMMENT ON FUNCTION notify_device_change() IS 'Notifies about changes to devices for real-time updates';
