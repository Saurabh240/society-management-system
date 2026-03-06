BEGIN;
drop table if exists communities;

create table if not exists associations(
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL references tenants(id) on delete cascade,
    name VARCHAR(150) NOT NULL,
    status VARCHAR(20) NOT NULL,
    street_address varchar(255),
    city varchar(100),
    state varchar(100),
    zip_code varchar(20),
    tax_identity_type varchar(50),
    tax_payer_id varchar(50),
    created_at timestamptz(6),
    updated_at timestamptz(6) NULL,
    total_units int default 0;
)
create index idx_association_tenant_id if not exists on associations(tenant_id);

alter table units
    drop column if exists community_id;
alter table units
    add column if not exists association_id;
alter table units
    add constraint fk_units_association_id foreign key (association_id) references associations(id);

drop index if exists idx_units_community_id;

create index idx_units_association_id if not exists on units(association_id);

-- update total units
update associations set total_units = (select count(*) from units where units.association_id = associations.id);
COMMIT;