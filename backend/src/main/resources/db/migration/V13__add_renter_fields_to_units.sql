-- Add renter information fields to units table
ALTER TABLE units ADD COLUMN renter_first_name VARCHAR(100);
ALTER TABLE units ADD COLUMN renter_last_name VARCHAR(100);
ALTER TABLE units ADD COLUMN renter_email VARCHAR(255);
ALTER TABLE units ADD COLUMN renter_phone VARCHAR(20);

-- Add indexes for renter email and phone for better search performance
CREATE INDEX IF NOT EXISTS idx_units_renter_email ON units(renter_email) WHERE renter_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_units_renter_phone ON units(renter_phone) WHERE renter_phone IS NOT NULL;