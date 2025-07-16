
CREATE TABLE IF NOT EXISTS water_tests (
    sample_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(255),
    location_code VARCHAR(255),
    timestamp_utc TIMESTAMPTZ NOT NULL,
    captured_by VARCHAR(255),
    method_code VARCHAR(255),
    value NUMERIC NOT NULL,
    unit VARCHAR(50) NOT NULL,
    qualifier VARCHAR(50),
    sample_type VARCHAR(50),
    temp_c NUMERIC,
    residual_chlorine_mg_l NUMERIC,
    ph NUMERIC,
    turbidity_ntu NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
