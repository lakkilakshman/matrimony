-- Sample Data for Merukayana Matrimony Database
USE merukayana_matrimony;

-- Create admin user (password: admin123)
-- Hash generated using bcrypt with 10 rounds
INSERT INTO users (email, mobile, password_hash, role, status, email_verified, mobile_verified) 
VALUES (
  'admin@merukayana.com',
  '9999999999',
  '$2a$10$rOZJKvJr5fHKvXH.gKX8/.vZ8qKZ5yH5qKZ5yH5qKZ5yH5qKZ5yH5q',
  'admin',
  'active',
  TRUE,
  TRUE
);

-- Create sample user 1 (password: user123)
INSERT INTO users (email, mobile, password_hash, role, status, email_verified, mobile_verified) 
VALUES (
  'priya.sharma@email.com',
  '9876543210',
  '$2a$10$rOZJKvJr5fHKvXH.gKX8/.vZ8qKZ5yH5qKZ5yH5qKZ5yH5qKZ5yH5q',
  'user',
  'active',
  TRUE,
  TRUE
);

-- Create profile for user 1
INSERT INTO profiles (user_id, first_name, last_name, gender, date_of_birth, marital_status, religion, caste, height, weight, bio, profile_status)
VALUES (
  2,
  'Priya',
  'Sharma',
  'female',
  '1999-05-15',
  'never_married',
  'Hindu',
  'Merukayana',
  '5.4',
  '55',
  'Software engineer working in a top MNC. Looking for a caring and understanding life partner.',
  'verified'
);

-- Add location details for profile 1
INSERT INTO location_details (profile_id, permanent_address, city, state, country, current_location, pincode)
VALUES (
  1,
  '123 Main Street, Hyderabad',
  'Hyderabad',
  'Telangana',
  'India',
  'Hyderabad, Telangana',
  '500001'
);

-- Add professional details for profile 1
INSERT INTO professional_details (profile_id, occupation, occupation_category, company_name, annual_income, work_location)
VALUES (
  1,
  'Software Engineer',
  'software_engineer',
  'Tech Corp India',
  '10-15',
  'Hyderabad'
);

-- Add education details for profile 1
INSERT INTO education_details (profile_id, education_level, field_of_study, institution, year_of_completion)
VALUES (
  1,
  'masters',
  'Computer Science',
  'IIT Hyderabad',
  2021
);

-- Add family details for profile 1
INSERT INTO family_details (profile_id, father_name, father_occupation, mother_name, mother_occupation, brothers, sisters, family_type, family_status, family_values)
VALUES (
  1,
  'Rajesh Sharma',
  'Business',
  'Sunita Sharma',
  'Homemaker',
  1,
  0,
  'nuclear',
  'upper_middle_class',
  'traditional'
);

-- Add astrology details for profile 1
INSERT INTO astrology_details (profile_id, raasi, star, birth_time, birth_place, dosham)
VALUES (
  1,
  'kanya',
  'hasta',
  '10:30:00',
  'Hyderabad',
  'no'
);

-- Create sample user 2 (password: user123)
INSERT INTO users (email, mobile, password_hash, role, status, email_verified, mobile_verified) 
VALUES (
  'rajesh.kumar@email.com',
  '9876543211',
  '$2a$10$rOZJKvJr5fHKvXH.gKX8/.vZ8qKZ5yH5qKZ5yH5qKZ5yH5qKZ5yH5q',
  'user',
  'active',
  TRUE,
  TRUE
);

-- Create profile for user 2
INSERT INTO profiles (user_id, first_name, last_name, gender, date_of_birth, marital_status, religion, caste, height, weight, bio, profile_status)
VALUES (
  3,
  'Rajesh',
  'Kumar',
  'male',
  '1996-08-20',
  'never_married',
  'Hindu',
  'Merukayana',
  '5.10',
  '72',
  'Mechanical engineer with stable career. Family-oriented person seeking a life partner.',
  'verified'
);

-- Add location details for profile 2
INSERT INTO location_details (profile_id, permanent_address, city, state, country, current_location, pincode)
VALUES (
  2,
  '456 Park Avenue, Bangalore',
  'Bangalore',
  'Karnataka',
  'India',
  'Bangalore, Karnataka',
  '560001'
);

-- Add professional details for profile 2
INSERT INTO professional_details (profile_id, occupation, occupation_category, company_name, annual_income, work_location)
VALUES (
  2,
  'Mechanical Engineer',
  'engineer',
  'Engineering Solutions Ltd',
  '7-10',
  'Bangalore'
);

-- Add education details for profile 2
INSERT INTO education_details (profile_id, education_level, field_of_study, institution, year_of_completion)
VALUES (
  2,
  'bachelors',
  'Mechanical Engineering',
  'NIT Karnataka',
  2018
);

-- Add family details for profile 2
INSERT INTO family_details (profile_id, father_name, father_occupation, mother_name, mother_occupation, brothers, sisters, family_type, family_status, family_values)
VALUES (
  2,
  'Suresh Kumar',
  'Government Employee',
  'Lakshmi Kumar',
  'Teacher',
  0,
  1,
  'nuclear',
  'middle_class',
  'moderate'
);

-- Add astrology details for profile 2
INSERT INTO astrology_details (profile_id, raasi, star, birth_time, birth_place, dosham)
VALUES (
  2,
  'simha',
  'magha',
  '06:15:00',
  'Bangalore',
  'no'
);

-- NOTE: To use these sample users, you need to generate proper bcrypt hashes
-- Use this Node.js code to generate password hashes:
-- 
-- const bcrypt = require('bcryptjs');
-- const hash = bcrypt.hashSync('admin123', 10);
-- console.log(hash);
-- 
-- Replace the password_hash values above with the generated hashes
