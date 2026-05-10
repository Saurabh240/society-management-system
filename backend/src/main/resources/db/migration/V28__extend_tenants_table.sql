ALTER TABLE tenants ADD COLUMN street_address  VARCHAR(255);
ALTER TABLE tenants ADD COLUMN city            VARCHAR(100);
ALTER TABLE tenants ADD COLUMN state           VARCHAR(100);
ALTER TABLE tenants ADD COLUMN zip_code        VARCHAR(10);
ALTER TABLE tenants ADD COLUMN phone           VARCHAR(20);
ALTER TABLE tenants ADD COLUMN email           VARCHAR(255);
ALTER TABLE tenants ADD COLUMN account_owner   VARCHAR(255);
ALTER TABLE tenants ADD COLUMN account_url     VARCHAR(255);