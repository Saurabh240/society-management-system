create table if not exists units (
    id bigserial primary key,
    tenant_id bigint not null references tenants(id) on delete cascade,
    property_id bigint not null references properties(id) on delete cascade,
    unit_number varchar(100) not null,
    occupancy_status varchar(50) not null,
    created_at timestamptz(6) not null default now(),
    updated_at timestamptz(6)
);

create index if not exists idx_units_tenant_id on units(tenant_id);
create index if not exists idx_units_property_id on units(property_id);
create unique index if not exists idx_units_tenant_property_unit_number on units(tenant_id, property_id, unit_number);
