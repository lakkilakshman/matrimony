/* Form Field Options Table - stores dynamic dropdown options for registration forms */

CREATE TABLE IF NOT EXISTS form_field_options (
  id INT PRIMARY KEY AUTO_INCREMENT,
  field_name VARCHAR(50) NOT NULL,
  option_value VARCHAR(255) NOT NULL,
  option_label VARCHAR(255) NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_field_option (field_name, option_value),
  INDEX idx_field_name (field_name),
  INDEX idx_active (is_active)
);

-- Insert default options for Marital Status
INSERT INTO form_field_options (field_name, option_value, option_label, display_order) VALUES
('maritalStatus', 'never_married', 'Never Married', 1),
('maritalStatus', 'divorced', 'Divorced', 2),
('maritalStatus', 'widowed', 'Widowed', 3),
('maritalStatus', 'separated', 'Separated', 4);

-- Insert default options for Height
INSERT INTO form_field_options (field_name, option_value, option_label, display_order) VALUES
('height', '4.6', '4\'6"', 1),
('height', '4.7', '4\'7"', 2),
('height', '4.8', '4\'8"', 3),
('height', '4.9', '4\'9"', 4),
('height', '4.10', '4\'10"', 5),
('height', '4.11', '4\'11"', 6),
('height', '5.0', '5\'0"', 7),
('height', '5.1', '5\'1"', 8),
('height', '5.2', '5\'2"', 9),
('height', '5.3', '5\'3"', 10),
('height', '5.4', '5\'4"', 11),
('height', '5.5', '5\'5"', 12),
('height', '5.6', '5\'6"', 13),
('height', '5.7', '5\'7"', 14),
('height', '5.8', '5\'8"', 15),
('height', '5.9', '5\'9"', 16),
('height', '5.10', '5\'10"', 17),
('height', '5.11', '5\'11"', 18),
('height', '6.0', '6\'0"', 19),
('height', '6.1', '6\'1"', 20),
('height', '6.2', '6\'2"', 21),
('height', '6.3', '6\'3"', 22);

-- Insert default options for Education
INSERT INTO form_field_options (field_name, option_value, option_label, display_order) VALUES
('education', 'high_school', 'High School', 1),
('education', 'diploma', 'Diploma', 2),
('education', 'bachelors', 'Bachelor\'s Degree', 3),
('education', 'masters', 'Master\'s Degree', 4),
('education', 'phd', 'PhD', 5),
('education', 'professional', 'Professional Degree', 6);

-- Insert default options for Occupation
INSERT INTO form_field_options (field_name, option_value, option_label, display_order) VALUES
('occupation', 'software_engineer', 'Software Engineer', 1),
('occupation', 'doctor', 'Doctor', 2),
('occupation', 'teacher', 'Teacher', 3),
('occupation', 'business', 'Business', 4),
('occupation', 'engineer', 'Engineer', 5),
('occupation', 'accountant', 'Accountant', 6),
('occupation', 'lawyer', 'Lawyer', 7),
('occupation', 'government_employee', 'Government Employee', 8),
('occupation', 'private_employee', 'Private Employee', 9),
('occupation', 'self_employed', 'Self Employed', 10),
('occupation', 'homemaker', 'Homemaker', 11),
('occupation', 'student', 'Student', 12),
('occupation', 'other', 'Other', 13);

-- Insert default options for Annual Income
INSERT INTO form_field_options (field_name, option_value, option_label, display_order) VALUES
('annualIncome', '0-3', 'Below 3 Lakhs', 1),
('annualIncome', '3-5', '3-5 Lakhs', 2),
('annualIncome', '5-7', '5-7 Lakhs', 3),
('annualIncome', '7-10', '7-10 Lakhs', 4),
('annualIncome', '10-15', '10-15 Lakhs', 5),
('annualIncome', '15-20', '15-20 Lakhs', 6),
('annualIncome', '20-30', '20-30 Lakhs', 7),
('annualIncome', '30+', 'Above 30 Lakhs', 8);

-- Insert default options for Raasi
INSERT INTO form_field_options (field_name, option_value, option_label, display_order) VALUES
('raasi', 'mesha', 'Mesha (Aries)', 1),
('raasi', 'vrishabha', 'Vrishabha (Taurus)', 2),
('raasi', 'mithuna', 'Mithuna (Gemini)', 3),
('raasi', 'karka', 'Karka (Cancer)', 4),
('raasi', 'simha', 'Simha (Leo)', 5),
('raasi', 'kanya', 'Kanya (Virgo)', 6),
('raasi', 'tula', 'Tula (Libra)', 7),
('raasi', 'vrishchika', 'Vrishchika (Scorpio)', 8),
('raasi', 'dhanu', 'Dhanu (Sagittarius)', 9),
('raasi', 'makara', 'Makara (Capricorn)', 10),
('raasi', 'kumbha', 'Kumbha (Aquarius)', 11),
('raasi', 'meena', 'Meena (Pisces)', 12);

-- Insert default options for Star
INSERT INTO form_field_options (field_name, option_value, option_label, display_order) VALUES
('star', 'ashwini', 'Ashwini', 1),
('star', 'bharani', 'Bharani', 2),
('star', 'krittika', 'Krittika', 3),
('star', 'rohini', 'Rohini', 4),
('star', 'mrigashira', 'Mrigashira', 5),
('star', 'ardra', 'Ardra', 6),
('star', 'punarvasu', 'Punarvasu', 7),
('star', 'pushya', 'Pushya', 8),
('star', 'ashlesha', 'Ashlesha', 9),
('star', 'magha', 'Magha', 10),
('star', 'purva_phalguni', 'Purva Phalguni', 11),
('star', 'uttara_phalguni', 'Uttara Phalguni', 12),
('star', 'hasta', 'Hasta', 13),
('star', 'chitra', 'Chitra', 14),
('star', 'swati', 'Swati', 15),
('star', 'vishakha', 'Vishakha', 16),
('star', 'anuradha', 'Anuradha', 17),
('star', 'jyeshtha', 'Jyeshtha', 18),
('star', 'moola', 'Moola', 19),
('star', 'purva_ashadha', 'Purva Ashadha', 20),
('star', 'uttara_ashadha', 'Uttara Ashadha', 21),
('star', 'shravana', 'Shravana', 22),
('star', 'dhanishta', 'Dhanishta', 23),
('star', 'shatabhisha', 'Shatabhisha', 24),
('star', 'purva_bhadrapada', 'Purva Bhadrapada', 25),
('star', 'uttara_bhadrapada', 'Uttara Bhadrapada', 26),
('star', 'revati', 'Revati', 27);

-- Insert default options for Location
INSERT INTO form_field_options (field_name, option_value, option_label, display_order) VALUES
('location', 'hyderabad', 'Hyderabad', 1),
('location', 'bangalore', 'Bangalore', 2),
('location', 'mumbai', 'Mumbai', 3),
('location', 'delhi', 'Delhi', 4),
('location', 'chennai', 'Chennai', 5),
('location', 'pune', 'Pune', 6),
('location', 'kolkata', 'Kolkata', 7),
('location', 'ahmedabad', 'Ahmedabad', 8),
('location', 'visakhapatnam', 'Visakhapatnam', 9),
('location', 'vijayawada', 'Vijayawada', 10),
('location', 'other', 'Other', 11);

-- Insert default options for Religion
INSERT INTO form_field_options (field_name, option_value, option_label, display_order) VALUES
('religion', 'hindu', 'Hindu', 1),
('religion', 'muslim', 'Muslim', 2),
('religion', 'christian', 'Christian', 3),
('religion', 'sikh', 'Sikh', 4),
('religion', 'jain', 'Jain', 5),
('religion', 'buddhist', 'Buddhist', 6),
('religion', 'other', 'Other', 7);

-- Insert default options for Caste
INSERT INTO form_field_options (field_name, option_value, option_label, display_order) VALUES
('caste', 'merukulam', 'Merukulam', 1),
('caste', 'brahmin', 'Brahmin', 2),
('caste', 'kshatriya', 'Kshatriya', 3),
('caste', 'vaishya', 'Vaishya', 4),
('caste', 'reddy', 'Reddy', 5),
('caste', 'kamma', 'Kamma', 6),
('caste', 'kapu', 'Kapu', 7),
('caste', 'velama', 'Velama', 8),
('caste', 'other', 'Other', 9);

-- Insert default options for Father's Occupation (same as occupation)
INSERT INTO form_field_options (field_name, option_value, option_label, display_order) VALUES
('fatherOccupation', 'software_engineer', 'Software Engineer', 1),
('fatherOccupation', 'doctor', 'Doctor', 2),
('fatherOccupation', 'teacher', 'Teacher', 3),
('fatherOccupation', 'business', 'Business', 4),
('fatherOccupation', 'engineer', 'Engineer', 5),
('fatherOccupation', 'accountant', 'Accountant', 6),
('fatherOccupation', 'lawyer', 'Lawyer', 7),
('fatherOccupation', 'government_employee', 'Government Employee', 8),
('fatherOccupation', 'private_employee', 'Private Employee', 9),
('fatherOccupation', 'self_employed', 'Self Employed', 10),
('fatherOccupation', 'farmer', 'Farmer', 11),
('fatherOccupation', 'retired', 'Retired', 12),
('fatherOccupation', 'other', 'Other', 13);

-- Insert default options for Mother's Occupation (same as occupation)
INSERT INTO form_field_options (field_name, option_value, option_label, display_order) VALUES
('motherOccupation', 'software_engineer', 'Software Engineer', 1),
('motherOccupation', 'doctor', 'Doctor', 2),
('motherOccupation', 'teacher', 'Teacher', 3),
('motherOccupation', 'business', 'Business', 4),
('motherOccupation', 'engineer', 'Engineer', 5),
('motherOccupation', 'accountant', 'Accountant', 6),
('motherOccupation', 'lawyer', 'Lawyer', 7),
('motherOccupation', 'government_employee', 'Government Employee', 8),
('motherOccupation', 'private_employee', 'Private Employee', 9),
('motherOccupation', 'self_employed', 'Self Employed', 10),
('motherOccupation', 'homemaker', 'Homemaker', 11),
('motherOccupation', 'retired', 'Retired', 12),
('motherOccupation', 'other', 'Other', 13);
