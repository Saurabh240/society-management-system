-- =============================================================================
-- V35__create_tenant_seed_data_procedure.sql
--
-- Creates a stored procedure that seeds default data for a new tenant.
-- Called from TenantService.createTenant() via JdbcTemplate after tenant
-- and admin user are saved.
--
-- Seeds:
--   1. Default Chart of Accounts (8 standard accounts)
--   2. A sample Association
--   3. Two sample Units
--   4. One sample Owner
--   5. One sample Bank Account
--   6. Two sample Communication Templates
-- =============================================================================

CREATE OR REPLACE PROCEDURE seed_tenant_data(p_tenant_id BIGINT)
LANGUAGE plpgsql
AS $$
DECLARE
    v_association_id BIGINT;
    v_unit_101_id    BIGINT;
    v_unit_102_id    BIGINT;
    v_coa_assets_id  BIGINT;
    v_coa_liab_id    BIGINT;
    v_coa_equity_id  BIGINT;
    v_coa_income_id  BIGINT;
    v_coa_expense_id BIGINT;
BEGIN

    -- ── 1. Chart of Accounts ─────────────────────────────────────────────────
    INSERT INTO chart_of_accounts (tenant_id, account_code, account_name, account_type, notes, is_deleted, created_at)
    VALUES
        (p_tenant_id, '1000', 'Cash - Operating Account',  'ASSETS',      'Primary bank account',              false, NOW()),
        (p_tenant_id, '1100', 'Accounts Receivable',       'ASSETS',      'Owner dues and fees owed to HOA',   false, NOW()),
        (p_tenant_id, '2000', 'Accounts Payable',          'LIABILITIES', 'Amounts owed to vendors',           false, NOW()),
        (p_tenant_id, '2100', 'Reserve Fund Liability',    'LIABILITIES', 'Long-term reserve fund',            false, NOW()),
        (p_tenant_id, '3000', 'Retained Earnings',         'EQUITY',      'Accumulated surplus / deficit',     false, NOW()),
        (p_tenant_id, '4000', 'HOA Fees',                  'INCOME',      'Monthly assessment income',         false, NOW()),
        (p_tenant_id, '4100', 'Late Fees',                 'INCOME',      'Penalties for late payment',        false, NOW()),
        (p_tenant_id, '5000', 'Landscaping & Grounds',     'EXPENSES',    'Landscaping vendor costs',          false, NOW()),
        (p_tenant_id, '5100', 'Maintenance & Repairs',     'EXPENSES',    'General maintenance costs',         false, NOW()),
        (p_tenant_id, '5200', 'Utilities',                 'EXPENSES',    'Water, electricity, gas',           false, NOW()),
        (p_tenant_id, '5300', 'Insurance',                 'EXPENSES',    'Property and liability insurance',  false, NOW()),
        (p_tenant_id, '5400', 'Administrative Expenses',   'EXPENSES',    'Office, printing, postage',         false, NOW())
    ON CONFLICT DO NOTHING;

    -- ── 2. Sample Association ─────────────────────────────────────────────────
    INSERT INTO associations (tenant_id, name, street_address, city, state, zip_code, status, tax_identity_type, tax_payer_id, created_at)
    VALUES (
        p_tenant_id,
        'Sample HOA Community',
        '100 Community Drive',
        'Los Angeles',
        'CA',
        '90001',
        'ACTIVE',
        'EIN',
        '00-0000000',
        NOW()
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_association_id;

    -- Guard: if association already existed (ON CONFLICT), look it up
    IF v_association_id IS NULL THEN
        SELECT id INTO v_association_id
        FROM associations
        WHERE tenant_id = p_tenant_id
          AND name = 'Sample HOA Community'
        LIMIT 1;
    END IF;

    -- Only seed units/owners if we got an association
    IF v_association_id IS NOT NULL THEN

        -- ── 3. Sample Units ───────────────────────────────────────────────────
        INSERT INTO units (tenant_id, association_id, unit_number, street, city, state, zip_code, occupancy_status, balance, created_at)
        VALUES
            (p_tenant_id, v_association_id, '101', '100 Community Drive Unit 101', 'Los Angeles', 'CA', '90001', 'OWNER_OCCUPIED', 0, NOW()),
            (p_tenant_id, v_association_id, '102', '100 Community Drive Unit 102', 'Los Angeles', 'CA', '90001', 'VACANT',         0, NOW())
        ON CONFLICT DO NOTHING
        RETURNING id INTO v_unit_101_id;

        -- Fetch unit 101 ID if insert was skipped due to conflict
        IF v_unit_101_id IS NULL THEN
            SELECT id INTO v_unit_101_id FROM units
            WHERE tenant_id = p_tenant_id AND association_id = v_association_id AND unit_number = '101'
            LIMIT 1;
        END IF;

        -- ── 4. Sample Owner (linked to Unit 101) ──────────────────────────────
        IF v_unit_101_id IS NOT NULL THEN
            INSERT INTO owners (
                tenant_id, association_id, first_name, last_name, email, phone,
                primary_street, primary_city, primary_state, primary_zip,
                is_board_member, created_at
            )
            VALUES (
                p_tenant_id, v_association_id,
                'Sample', 'Owner', 'sample.owner@example.com', '(555) 000-0000',
                '100 Community Drive Unit 101', 'Los Angeles', 'CA', '90001',
                false, NOW()
            )
            ON CONFLICT DO NOTHING;
        END IF;

    END IF;

    -- ── 5. Sample Bank Account ────────────────────────────────────────────────
    IF v_association_id IS NOT NULL THEN
        INSERT INTO bank_accounts (
            tenant_id, association_id, bank_account_name, account_type,
            country, routing_number, account_number_masked,
            account_notes, check_printing_enabled, balance, created_at
        )
        VALUES (
            p_tenant_id, v_association_id,
            'Operating Account',
            'CHECKING',
            'United States',
            '000000000',
            '****0000',
            'Default operating account — update routing and account numbers before use',
            false,
            0.00,
            NOW()
        )
        ON CONFLICT DO NOTHING;
    END IF;

    -- ── 6. Communication Templates ────────────────────────────────────────────
    INSERT INTO communication_templates (
        tenant_id, name, level, category, description, subject, content, created_at
    )
    VALUES
    (
        p_tenant_id,
        'Monthly HOA Fee Reminder',
        'ASSOCIATION',
        'BILLING',
        'Send to all owners to remind them of monthly dues',
        'HOA Fee Due — {{associationName}}',
        E'Dear {{ownerName}},\n\nThis is a friendly reminder that your monthly HOA assessment is due.\n\nAssociation: {{associationName}}\nUnit: {{unitNumber}}\n\nPlease make your payment by the due date to avoid late fees.\n\nThank you,\n{{associationName}} Management Team',
        NOW()
    ),
    (
        p_tenant_id,
        'Welcome New Owner',
        'INDIVIDUAL',
        'WELCOME',
        'Send to newly added owners',
        'Welcome to {{associationName}}, {{ownerName}}!',
        E'Dear {{ownerName}},\n\nWelcome to {{associationName}}! We are pleased to have you as a member of our community.\n\nYour unit number is {{unitNumber}}. If you have any questions, please do not hesitate to contact the management team.\n\nWarm regards,\n{{associationName}} Management',
        NOW()
    ),
    (
        p_tenant_id,
        'Board Meeting Notice',
        'ASSOCIATION',
        'ANNOUNCEMENT',
        'Notify all owners of upcoming board meetings',
        'Board Meeting Notice — {{associationName}}',
        E'Dear {{ownerName}},\n\nYou are cordially invited to attend the upcoming Board Meeting for {{associationName}}.\n\nDate: {{date}}\n\nAll residents are welcome to attend. Agenda items will be distributed prior to the meeting.\n\nBest regards,\nThe Board of Directors',
        NOW()
    )
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Seed data created for tenant %', p_tenant_id;

END;
$$;