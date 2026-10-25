CREATE TABLE IF NOT EXISTS users (
 id SERIAL PRIMARY KEY, name VARCHAR(80) NOT NULL CHECK(length(name)>=2),
 email VARCHAR(254) UNIQUE NOT NULL, password_hash TEXT NOT NULL,
 hostel_name VARCHAR(100) NOT NULL, block VARCHAR(50) NOT NULL,
 role VARCHAR(10) NOT NULL DEFAULT 'student' CHECK(role IN ('student','admin')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS categories (id SERIAL PRIMARY KEY, name VARCHAR(60) UNIQUE NOT NULL);
CREATE TABLE IF NOT EXISTS listings (
 id SERIAL PRIMARY KEY, seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 category_id INTEGER NOT NULL REFERENCES categories(id), title VARCHAR(120) NOT NULL,
 description TEXT NOT NULL CHECK(length(description) BETWEEN 10 AND 5000),
 price NUMERIC(10,2) NOT NULL CHECK(price>0 AND price<=10000000),
 original_price NUMERIC(10,2) CHECK(original_price>0 AND original_price<=10000000),
 condition VARCHAR(15) NOT NULL CHECK(condition IN ('Like New','Good','Fair')),
 image_path TEXT NOT NULL, hostel_name VARCHAR(100) NOT NULL, block VARCHAR(50) NOT NULL,
 status VARCHAR(15) NOT NULL DEFAULT 'available' CHECK(status IN ('available','sold','hidden')),
 pre_hidden_status VARCHAR(15) CHECK(pre_hidden_status IN ('available','sold')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS reports (
 id SERIAL PRIMARY KEY, listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
 reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 reason TEXT NOT NULL CHECK(length(reason) BETWEEN 10 AND 1000),
 status VARCHAR(15) NOT NULL DEFAULT 'open' CHECK(status IN ('open','reviewed')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(listing_id, reporter_id)
);
CREATE INDEX IF NOT EXISTS listings_marketplace_idx ON listings(status,created_at DESC);
CREATE INDEX IF NOT EXISTS listings_category_price_idx ON listings(category_id,price);
CREATE INDEX IF NOT EXISTS listings_location_idx ON listings(hostel_name,block);
CREATE INDEX IF NOT EXISTS listings_seller_idx ON listings(seller_id);
CREATE INDEX IF NOT EXISTS listings_condition_idx ON listings(condition);
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports(status);
CREATE OR REPLACE FUNCTION touch_listing() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS listing_updated ON listings;
CREATE TRIGGER listing_updated BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION touch_listing();
INSERT INTO categories(name) VALUES ('Textbooks'),('Electronics'),('Room Essentials'),('Sports & Fitness'),('Cycles'),('Other') ON CONFLICT DO NOTHING;
