CREATE TABLE IF NOT EXISTS communities (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL references tenants(id) on delete cascade,
    name VARCHAR(150) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at timestamptz(6),
    updated_at timestamptz(6) NULL
);

create index IF NOT EXISTS idx_communities_tenant_id on communities(tenant_id);
create index IF NOT EXISTS idx_communities_name on communities(name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_communities_unique ON communities(tenant_id,name);
