-- Add missing field options for complexion, father occupation, and mother occupation
-- These are needed for the dropdown fields in AdminProfilesPage

-- Complexion options
INSERT INTO form_field_options (field_name, option_value, option_label, display_order) VALUES
('complexion', 'very_fair', 'Very Fair', 1),
('complexion', 'fair', 'Fair', 2),
('complexion', 'wheatish', 'Wheatish', 3),
('complexion', 'wheatish_brown', 'Wheatish Brown', 4),
('complexion', 'dark', 'Dark', 5);

-- Father's Occupation options (expanding beyond just 'farmer')
INSERT INTO form_field_options (field_name, option_value, option_label, display_order) VALUES
('fatherOccupation', 'business', 'Business', 2),
('fatherOccupation', 'government_service', 'Government Service', 3),
('fatherOccupation', 'private_service', 'Private Service', 4),
('fatherOccupation', 'professional', 'Professional', 5),
('fatherOccupation', 'retired', 'Retired', 6),
('fatherOccupation', 'not_employed', 'Not Employed', 7),
('fatherOccupation', 'passed_away', 'Passed Away', 8);

-- Mother's Occupation options (expanding beyond just 'house wife')
INSERT INTO form_field_options (field_name, option_value, option_label, display_order) VALUES
('motherOccupation', 'business', 'Business', 2),
('motherOccupation', 'government_service', 'Government Service', 3),
('motherOccupation', 'private_service', 'Private Service', 4),
('motherOccupation', 'professional', 'Professional', 5),
('motherOccupation', 'retired', 'Retired', 6),
('motherOccupation', 'not_employed', 'Not Employed', 7),
('motherOccupation', 'passed_away', 'Passed Away', 8);
