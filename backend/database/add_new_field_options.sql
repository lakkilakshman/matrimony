-- Add new field options for dynamic form management
-- Run this SQL to add religion, caste, and parent occupation options

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

-- Insert default options for Father's Occupation
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

-- Insert default options for Mother's Occupation
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
