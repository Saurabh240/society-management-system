CREATE TABLE subscriptions (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    unit_limit INT NOT NULL,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT now()
);