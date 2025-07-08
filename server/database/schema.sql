-- Planning Poker MySQL Database Schema
-- Create database (run this in phpMyAdmin or MySQL CLI)
-- CREATE DATABASE planning_poker;
-- USE planning_poker;

-- Voting Systems table
CREATE TABLE voting_systems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    `values` JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Rooms table
CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_code VARCHAR(6) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    host_id INT DEFAULT NULL,
    is_voting_revealed BOOLEAN DEFAULT FALSE,
    current_story_id INT DEFAULT NULL,
    voting_system_name VARCHAR(100) DEFAULT 'Fibonacci',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_room_code (room_code),
    INDEX idx_host_id (host_id),
    INDEX idx_current_story_id (current_story_id)
);

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    is_host BOOLEAN DEFAULT FALSE,
    is_connected BOOLEAN DEFAULT TRUE,
    vote VARCHAR(50) DEFAULT NULL,
    has_voted BOOLEAN DEFAULT FALSE,
    room_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_room_id (room_id),
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Stories table
CREATE TABLE stories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT DEFAULT NULL,
    estimate VARCHAR(50) DEFAULT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    room_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_room_id (room_id),
    INDEX idx_is_active (is_active),
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Add foreign key constraints for rooms table (after all tables are created)
ALTER TABLE rooms 
ADD CONSTRAINT fk_rooms_host_id 
FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE rooms 
ADD CONSTRAINT fk_rooms_current_story_id 
FOREIGN KEY (current_story_id) REFERENCES stories(id) ON DELETE SET NULL;

-- Insert default voting systems
INSERT INTO voting_systems (name, `values`) VALUES 
('Fibonacci', '["0", "1", "2", "3", "5", "8", "13", "21", "34", "55", "89", "?"]'),
('Modified Fibonacci', '["0", "1/2", "1", "2", "3", "5", "8", "13", "20", "40", "100", "?"]'),
('T-Shirt Sizes', '["XS", "S", "M", "L", "XL", "XXL", "?"]'),
('Powers of 2', '["1", "2", "4", "8", "16", "32", "64", "?"]'),
('Linear', '["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "?"]');