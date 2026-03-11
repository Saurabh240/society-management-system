CREATE TABLE if not exists owners (
    id BIGSERIAL PRIMARY KEY,

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
    alt_phone VARCHAR(50)

);

create index if not exists idx_owners_email on owners(email);
create index if not exists idx_owners_phone on owners(phone);
