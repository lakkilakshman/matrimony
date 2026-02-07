-- System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value TEXT,
    setting_group VARCHAR(50),
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed Default Settings
INSERT INTO system_settings (setting_key, setting_value, setting_group, description) VALUES
('site_name', 'Merukulam Matrimony', 'general', 'The name of the website displayed in headers and titles.'),
('site_email', 'admin@merukulam.com', 'general', 'The official admin email address.'),
('auto_approval', 'false', 'security', 'Whether new profiles are automatically approved (true/false).'),
('email_notifications', 'true', 'notifications', 'Enable or disable global email notifications (true/false).'),
('sms_notifications', 'false', 'notifications', 'Enable or disable global SMS notifications (true/false).'),
('maintenance_mode', 'false', 'security', 'Toggle maintenance mode for the whole site (true/false).'),
('matrimony_id_prefix', 'MKM', 'ids', 'Prefix for newly generated Matrimony IDs.'),
('matrimony_id_start_number', '1', 'ids', 'The starting number for the next Matrimony ID generation.')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);
