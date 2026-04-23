CREATE DATABASE IF NOT EXISTS grassroots_sales
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE grassroots_sales;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  mobile VARCHAR(32) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  phone VARCHAR(32) NOT NULL DEFAULT '',
  focus VARCHAR(255) NOT NULL DEFAULT '',
  bio TEXT NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_mobile (mobile),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS clients (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'General',
  projects INT NOT NULL DEFAULT 0,
  leads INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_clients_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS settings (
  id INT NOT NULL PRIMARY KEY,
  notifications JSON NOT NULL,
  api_key VARCHAR(255) NOT NULL DEFAULT 'at_live_839210_kx72_nd92_pq11',
  stages JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_settings_notifications_json CHECK (JSON_VALID(notifications)),
  CONSTRAINT chk_settings_stages_json CHECK (JSON_VALID(stages))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS owner_targets (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  owner_name VARCHAR(255) NOT NULL,
  financial_year INT NOT NULL,
  period_type VARCHAR(32) NOT NULL,
  period_key VARCHAR(32) NOT NULL,
  target_amount DECIMAL(14, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_owner_targets_period (owner_name, financial_year, period_type, period_key),
  KEY idx_owner_targets_owner (owner_name),
  KEY idx_owner_targets_fy (financial_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS leads (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  company VARCHAR(255) NOT NULL,
  business_unit VARCHAR(255) NOT NULL,
  opportunity_name VARCHAR(255) NOT NULL DEFAULT '',
  client_name VARCHAR(255) NOT NULL,
  contact VARCHAR(255) NOT NULL DEFAULT '',
  phone VARCHAR(32) NOT NULL DEFAULT '',
  email VARCHAR(255) NOT NULL DEFAULT '',
  value DECIMAL(14, 2) NOT NULL DEFAULT 0,
  status VARCHAR(100) NOT NULL DEFAULT 'Prospecting',
  lifecycle VARCHAR(100) NOT NULL DEFAULT 'Active',
  industry VARCHAR(100) NOT NULL DEFAULT 'General',
  lob VARCHAR(100) NOT NULL DEFAULT 'General',
  owner VARCHAR(255) NOT NULL DEFAULT 'Anitha',
  source VARCHAR(100) NOT NULL DEFAULT 'Website Direct',
  currency VARCHAR(16) NOT NULL DEFAULT 'INR',
  date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  description TEXT NOT NULL,
  location JSON NULL,
  next_action VARCHAR(255) NOT NULL DEFAULT '',
  progress INT NOT NULL DEFAULT 25,
  website VARCHAR(255) NOT NULL DEFAULT '',
  comments JSON NOT NULL,
  activity JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_leads_owner (owner),
  KEY idx_leads_client_name (client_name),
  KEY idx_leads_status (status),
  KEY idx_leads_date (date),
  CONSTRAINT chk_leads_comments_json CHECK (JSON_VALID(comments)),
  CONSTRAINT chk_leads_activity_json CHECK (JSON_VALID(activity)),
  CONSTRAINT chk_leads_location_json CHECK (location IS NULL OR JSON_VALID(location))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
