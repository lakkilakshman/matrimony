INSERT INTO email_templates (name, slug, subject, body, is_active) VALUES 
('Welcome Email', 'welcome', 'Welcome to Merukayana Matrimony!', '<h1>Welcome, {{name}}!</h1><p>Thank you for registering with us. We are excited to help you find your perfect match.</p>', TRUE),
('Email Verification', 'verify_email', 'Verify your Email - Merukayana Matrimony', '<h1>Verify your Email</h1><p>Please use the OTP below to verify your email address:</p><h2>{{otp}}</h2>', TRUE),
('Password Reset', 'reset_password', 'Reset your Password', '<h1>Password Reset Request</h1><p>You requested a password reset. Use this OTP to proceed:</p><h2>{{otp}}</h2>', TRUE),
('Profile Approved', 'profile_approved', 'Your Profile is Approved!', '<h1>Congratulations!</h1><p>Your profile has been approved by our admin team. You are now visible to other members.</p>', TRUE),
('Interest Received', 'interest_received', 'New Interest Received', '<h1>Someone is interested in you!</h1><p>{{sender_name}} has expressed interest in your profile. Login to check!</p>', TRUE),
('Interest Accepted', 'interest_accepted', 'Interest Accepted', '<h1>It''s a Match!</h1><p>{{receiver_name}} has accepted your interest. You can now view their contact details and chat.</p>', TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);
