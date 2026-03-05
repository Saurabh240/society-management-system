BEGIN;
alter table communities rename to associations;

alter table associations
    add column if not exists street_address varchar(255),
    add column if not exists city varchar(100),
    add column if not exists state varchar(100),
    add column if not exists zip_code varchar(20),
    add column if not exists tax_identity_type varchar(50),
    add column if not exists tax_payer_id varchar(50),
    add column if not exists total_units int default 0;

alter table units
    rename column community_id to association_id;

alter table units
    add constraint fk_units_association_id foreign key (association_id) references associations(id);

drop index if exists idx_units_community_id;

create index idx_units_association_id on units(association_id);

-- update total units
update associations set total_units = (select count(*) from units where units.association_id = associations.id);
COMMIT;