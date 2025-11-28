CREATE TABLE IF NOT EXISTS urls (
    id BIGSERIAL PRIMARY KEY,
    short_code VARCHAR(10) UNIQUE NOT NULL,
    long_url TEXT NOT NULL,
    user_id INTEGER,
    click_count BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    custom_alias VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_short_code ON urls(short_code);
CREATE INDEX IF NOT EXISTS idx_user_created ON urls(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expires ON urls(expires_at);

CREATE TABLE IF NOT EXISTS clicks (
    id BIGSERIAL PRIMARY KEY,
    url_id BIGINT REFERENCES urls(id),
    ip_address INET,
    user_agent TEXT,
    referer TEXT,
    country_code CHAR(2),
    city VARCHAR(100),
    device_type VARCHAR(20),
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_url_clicked ON clicks(url_id, clicked_at);
CREATE INDEX IF NOT EXISTS idx_clicked_at ON clicks(clicked_at);

CREATE TABLE IF NOT EXISTS url_tags (
    url_id BIGINT REFERENCES urls(id),
    tag VARCHAR(50),
    PRIMARY KEY (url_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_tag ON url_tags(tag);
