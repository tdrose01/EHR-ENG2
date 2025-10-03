-- Insert test patients
INSERT INTO patients (
  first_name, last_name, gender, blood_type, 
  date_of_birth, phone_number, duty_status, paygrade, 
  branch_of_service, ethnicity, religion, rh_factor, dod_id, pid,
  occ_code, is_active
) VALUES
  ('John', 'Smith', 'Male', 'O', '1990-05-15', '5551234567', 'Active', 'E5', 'Army', 'Caucasian', 'Christian', 'Positive', 1234567890, 'P123456', 10, true),
  ('Maria', 'Garcia', 'Female', 'A', '1988-09-23', '5552345678', 'Reserve', 'O2', 'Air Force', 'Hispanic', 'Catholic', 'Negative', 2345678901, 'P234567', 40, true),
  ('James', 'Johnson', 'Male', 'B', '1985-03-30', '5553456789', 'Retired', 'E7', 'Marine Corps', 'African American', 'Protestant', 'Positive', 3456789012, 'P345678', 11, true),
  ('Sarah', 'Williams', 'Female', 'AB', '1992-11-08', '5554567890', 'Active', 'O1', 'Navy', 'Asian', 'Buddhist', 'Negative', 4567890123, 'P456789', 21, true),
  ('Michael', 'Brown', 'Male', 'O', '1983-07-19', '5555678901', 'Active', 'E4', 'Space Force', 'Caucasian', 'Jewish', 'Positive', 5678901234, 'P567890', 30, true),
  ('Jennifer', 'Davis', 'Female', 'A', '1987-12-25', '5556789012', 'Reserve', 'E6', 'Coast Guard', 'Pacific Islander', 'Hindu', 'Negative', 6789012345, 'P678901', 20, true),
  ('David', 'Miller', 'Male', 'B', '1995-02-14', '5557890123', 'Active', 'O3', 'Army', 'Mixed', 'Muslim', 'Positive', 7890123456, 'P789012', 50, true),
  ('Lisa', 'Anderson', 'Female', 'AB', '1991-08-03', '5558901234', 'Retired', 'E8', 'Air Force', 'Native American', 'Sikh', 'Negative', 8901234567, 'P890123', 11, true),
  ('Robert', 'Taylor', 'Male', 'O', '1986-04-17', '5559012345', 'Active', 'O4', 'Marine Corps', 'Hispanic', 'Orthodox', 'Positive', 9012345678, 'P901234', 21, true),
  ('Emily', 'Thomas', 'Female', 'A', '1993-10-11', '5550123456', 'Reserve', 'E3', 'Navy', 'Asian', 'None', 'Negative', 123456789, 'P012345', 10, true);