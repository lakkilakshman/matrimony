-- Payment System Database Schema
-- Add to existing merukayana_matrimony database

USE merukayana_matrimony;

-- Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    duration_months INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    features JSON,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active),
    INDEX idx_order (display_order)
);

-- Payment Settings Table (Bank & UPI Details)
CREATE TABLE IF NOT EXISTS payment_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    ifsc_code VARCHAR(20),
    account_holder_name VARCHAR(100),
    branch_name VARCHAR(100),
    upi_id VARCHAR(100),
    qr_code_image VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    plan_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('bank_transfer', 'upi') NOT NULL,
    transaction_id VARCHAR(100),
    payment_proof VARCHAR(255),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_notes TEXT,
    approved_by INT,
    approved_at TIMESTAMP NULL,
    rejected_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);

-- Add subscription fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS subscription_plan_id INT NULL,
ADD COLUMN IF NOT EXISTS subscription_status ENUM('none', 'pending', 'active', 'expired') DEFAULT 'none',
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP NULL,
ADD FOREIGN KEY (subscription_plan_id) REFERENCES subscription_plans(id) ON DELETE SET NULL;

-- Insert default subscription plans
INSERT INTO subscription_plans (name, duration_months, price, description, features, display_order, is_active) VALUES
('Basic Plan', 1, 499.00, 'Perfect for getting started', 
 JSON_ARRAY('View 50 profiles per month', 'Send 10 interests', 'Basic search filters', 'Email support'),
 1, TRUE),
('Premium Plan', 3, 1299.00, 'Most popular choice', 
 JSON_ARRAY('View unlimited profiles', 'Send unlimited interests', 'Advanced search filters', 'Priority support', 'Profile highlighting'),
 2, TRUE),
('Gold Plan', 6, 2199.00, 'Best value for serious seekers', 
 JSON_ARRAY('All Premium features', 'Dedicated relationship manager', 'Profile verification badge', 'Top search ranking', '24/7 phone support'),
 3, TRUE),
('Platinum Plan', 12, 3999.00, 'Ultimate matrimony experience', 
 JSON_ARRAY('All Gold features', 'Personalized matchmaking', 'Exclusive events access', 'Premium profile showcase', 'Lifetime support'),
 4, TRUE);

-- Insert default payment settings (update these with actual details)
INSERT INTO payment_settings (
    bank_name, 
    account_number, 
    ifsc_code, 
    account_holder_name, 
    branch_name,
    upi_id, 
    qr_code_image,
    is_active
) VALUES (
    'State Bank of India',
    '1234567890',
    'SBIN0001234',
    'Merukulam Matrimony',
    'Hyderabad Main Branch',
    'merukulam@sbi',
    '/uploads/qr-code.png',
    TRUE
)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
