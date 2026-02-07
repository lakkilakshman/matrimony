-- Merukayana Matrimony Database Schema
-- Database: merukayana_matrimony

CREATE DATABASE IF NOT EXISTS merukayana_matrimony;
USE merukayana_matrimony;

-- Drop existing tables (in reverse order of dependencies)
DROP TABLE IF EXISTS admin_logs;
DROP TABLE IF EXISTS otp_verifications;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS profile_views;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS interest_requests;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS partner_preferences;
DROP TABLE IF EXISTS profile_photos;
DROP TABLE IF EXISTS astrology_details;
DROP TABLE IF EXISTS location_details;
DROP TABLE IF EXISTS family_details;
DROP TABLE IF EXISTS professional_details;
DROP TABLE IF EXISTS education_details;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS users;

-- Users Table (Authentication)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile VARCHAR(15) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    mobile_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_mobile (mobile),
    INDEX idx_status (status)
);

-- Profiles Table (Main Profile Information)
CREATE TABLE profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    matrimony_id VARCHAR(20) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    gender ENUM('male', 'female') NOT NULL,
    date_of_birth DATE NOT NULL,
    age INT,
    marital_status ENUM('never_married', 'divorced', 'widowed', 'separated') NOT NULL,
    religion VARCHAR(50) DEFAULT 'Hindu',
    caste VARCHAR(50) DEFAULT 'Merukayana',
    height VARCHAR(10),
    weight VARCHAR(10),
    complexion VARCHAR(50),
    blood_group VARCHAR(5),
    physical_status VARCHAR(50),
    bio TEXT,
    profile_photo VARCHAR(255),
    profile_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    is_featured BOOLEAN DEFAULT FALSE, -- New column for featured profiles
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_matrimony_id (matrimony_id),
    INDEX idx_gender (gender),
    INDEX idx_age (age),
    INDEX idx_marital_status (marital_status),
    INDEX idx_status (profile_status),
    INDEX idx_is_featured (is_featured) -- Index for the new column
);

-- Education Details
CREATE TABLE education_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    profile_id INT NOT NULL,
    education_level ENUM('high_school', 'bachelors', 'masters', 'doctorate', 'diploma', 'other') NOT NULL,
    field_of_study VARCHAR(100),
    institution VARCHAR(255),
    year_of_completion YEAR,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    INDEX idx_profile (profile_id)
);

-- Professional Details
CREATE TABLE professional_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    profile_id INT UNIQUE NOT NULL,
    occupation VARCHAR(100),
    occupation_category ENUM('software_engineer', 'doctor', 'engineer', 'teacher', 'business', 'accountant', 'lawyer', 'government_employee', 'private_employee', 'self_employed', 'other'),
    company_name VARCHAR(255),
    annual_income VARCHAR(50),
    work_location VARCHAR(255),
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    INDEX idx_occupation (occupation_category),
    INDEX idx_income (annual_income)
);

-- Family Details
CREATE TABLE family_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    profile_id INT UNIQUE NOT NULL,
    father_name VARCHAR(100),
    father_occupation VARCHAR(100),
    mother_name VARCHAR(100),
    mother_occupation VARCHAR(100),
    brothers INT DEFAULT 0,
    sisters INT DEFAULT 0,
    family_type ENUM('nuclear', 'joint') DEFAULT 'nuclear',
    family_status ENUM('middle_class', 'upper_middle_class', 'rich', 'affluent'),
    family_values ENUM('traditional', 'moderate', 'liberal'),
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Location Details
CREATE TABLE location_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    profile_id INT UNIQUE NOT NULL,
    permanent_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    pincode VARCHAR(10),
    current_location VARCHAR(255),
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    INDEX idx_city (city),
    INDEX idx_state (state)
);

-- Astrology Details
CREATE TABLE astrology_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    profile_id INT UNIQUE NOT NULL,
    raasi VARCHAR(50),
    star VARCHAR(50),
    birth_time TIME,
    birth_place VARCHAR(255),
    gothram VARCHAR(100),
    dosham ENUM('yes', 'no', 'dont_know'),
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Profile Photos (Multiple photos per profile)
CREATE TABLE profile_photos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    profile_id INT NOT NULL,
    photo_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    INDEX idx_profile (profile_id)
);

-- Partner Preferences
CREATE TABLE partner_preferences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    profile_id INT UNIQUE NOT NULL,
    age_from INT,
    age_to INT,
    height_from VARCHAR(10),
    height_to VARCHAR(10),
    marital_status VARCHAR(100),
    education VARCHAR(255),
    occupation VARCHAR(255),
    income_from VARCHAR(50),
    income_to VARCHAR(50),
    location VARCHAR(255),
    other_preferences TEXT,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Favorites/Shortlist
CREATE TABLE favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    profile_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, profile_id),
    INDEX idx_user (user_id),
    INDEX idx_profile (profile_id)
);

-- Interest Requests
CREATE TABLE interest_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected', 'cancelled') DEFAULT 'pending',
    message TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES profiles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_interest (sender_id, receiver_id),
    INDEX idx_sender (sender_id),
    INDEX idx_receiver (receiver_id),
    INDEX idx_status (status)
);

-- Messages
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sender (sender_id),
    INDEX idx_receiver (receiver_id),
    INDEX idx_conversation (sender_id, receiver_id)
);

-- Profile Views (Track who viewed which profile)
CREATE TABLE profile_views (
    id INT PRIMARY KEY AUTO_INCREMENT,
    viewer_id INT NOT NULL,
    profile_id INT NOT NULL,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (viewer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    INDEX idx_viewer (viewer_id),
    INDEX idx_profile (profile_id)
);

-- Notifications
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('interest_received', 'interest_accepted', 'message', 'profile_view', 'profile_verified', 'system') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    related_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read)
);

-- Admin Activity Logs
CREATE TABLE admin_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT NOT NULL,
    action VARCHAR(255) NOT NULL,
    target_type VARCHAR(50),
    target_id INT,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_admin (admin_id),
    INDEX idx_created (created_at)
);

-- OTP Verification
CREATE TABLE otp_verifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255),
    mobile VARCHAR(15),
    otp VARCHAR(6) NOT NULL,
    type ENUM('email', 'mobile', 'both') NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_mobile (mobile)
);
