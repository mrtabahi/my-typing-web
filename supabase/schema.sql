-- DECODING HCM - COMPLETE POSTGRESQL DATABASE SCHEMA

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES TABLE
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'candidate' CHECK (role IN ('candidate', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TESTS / PASSAGES TABLE
CREATE TABLE tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    language TEXT NOT NULL CHECK (language IN ('English', 'Hindi')),
    passage TEXT NOT NULL,
    mode TEXT DEFAULT 'screen' CHECK (mode IN ('screen', 'page')),
    duration_minutes INT DEFAULT 10,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- EXAM ATTEMPTS TABLE
CREATE TABLE attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    candidate_name TEXT NOT NULL,
    candidate_id TEXT DEFAULT 'GUEST',
    test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
    language TEXT NOT NULL,
    mode TEXT NOT NULL,
    duration_seconds INT NOT NULL,
    typed_words INT NOT NULL,
    typed_characters INT NOT NULL,
    correct_characters INT NOT NULL,
    incorrect_characters INT NOT NULL,
    total_errors INT NOT NULL,
    free_errors INT NOT NULL,
    excess_errors INT NOT NULL,
    penalty_words INT NOT NULL,
    gross_wpm NUMERIC(6,2) NOT NULL,
    net_wpm NUMERIC(6,2) NOT NULL,
    accuracy NUMERIC(5,2) NOT NULL,
    suspicious_events JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- HIGH PERFORMANCE INDEXES
CREATE INDEX idx_attempts_net_wpm ON attempts(net_wpm DESC);
CREATE INDEX idx_attempts_created_at ON attempts(created_at DESC);
CREATE INDEX idx_tests_active ON tests(active);
