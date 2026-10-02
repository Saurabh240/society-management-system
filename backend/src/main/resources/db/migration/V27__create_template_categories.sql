-- Create template_categories table for tenant-specific category lookup
CREATE TABLE template_categories (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    category_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast tenant-scoped lookups
CREATE INDEX idx_template_categories_tenant_id ON template_categories(tenant_id);
CREATE INDEX idx_template_categories_tenant_category ON template_categories(tenant_id, category_name);
