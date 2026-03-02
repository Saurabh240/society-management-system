CREATE TABLE owners (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL references tenants(id),
    association_id BIGINT NOT NULL REFERENCES associations(id),
    unit_id BIGINT NOT NULL REFERENCES units(id),

    first_name VARCHAR(100),
    last_name VARCHAR(100),

    primary_street VARCHAR(255),
    primary_city VARCHAR(100),
    primary_state VARCHAR(100),
    primary_zip VARCHAR(20),

    alt_street VARCHAR(255),
    alt_city VARCHAR(100),
    alt_state VARCHAR(100),
    alt_zip VARCHAR(20),

    email VARCHAR(255),
    alt_email VARCHAR(255),

    phone VARCHAR(50),
    alt_phone VARCHAR(50),

    is_board_member BOOLEAN DEFAULT FALSE

);

create index idx_owners_tenant_id on owners(tenant_id);
create index idx_owners_association_id on owners(association_id);
create index idx_owners_unit_id on owners(unit_id);