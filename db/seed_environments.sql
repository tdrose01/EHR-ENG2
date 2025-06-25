INSERT INTO environments (name, status, last_check, api_version, db_status, uptime_seconds)
VALUES
  ('Production', 'Online', NOW(), 'v1.2.0', 'online', 86400),
  ('Staging', 'Degraded', NOW(), 'v1.2.0-rc', 'online', 43200);
