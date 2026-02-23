

create table if not exists properties(
    id BIGSERIAL primary key,
    name varchar(255) not null,
    tenant_id bigint not null references tenants(id) on delete cascade,
    community_id bigint not null references communities(id) on delete cascade,
    created_at timestamptz(6) not null default now(),
    updated_at timestamptz(6) null
);

create index if not exists idx_properties_tenant_id on properties(tenant_id);
create index if not exists idx_properties_community_id on properties(community_id);
create unique index if not exists idx_properties_tenant_community_name on properties(tenant_id, community_id, name);