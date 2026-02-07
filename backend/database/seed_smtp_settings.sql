INSERT INTO system_settings (setting_key, setting_value, setting_group) VALUES 
('smtp_host', 'smtp.gmail.com', 'email'),
('smtp_port', '587', 'email'),
('smtp_user', '', 'email'),
('smtp_pass', '', 'email'),
('smtp_from_email', '', 'email'),
('smtp_from_name', 'Merukayana Matrimony', 'email')
ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);
