CREATE TABLE support_tickets (
    id          BIGSERIAL       NOT NULL,
    tenant_id   BIGINT          NOT NULL,
    user_id     BIGINT          NOT NULL,
    subject     VARCHAR(255)    NOT NULL,
    description TEXT            NOT NULL,
    status      VARCHAR(20)     NOT NULL DEFAULT 'OPEN'
    CONSTRAINT chk_support_tickets_status
    CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_support_tickets PRIMARY KEY (id)
);

CREATE INDEX idx_support_tickets_tenant_id   ON support_tickets (tenant_id);
CREATE INDEX idx_support_tickets_tenant_user ON support_tickets (tenant_id, user_id);


CREATE TABLE feature_suggestions (
    id          BIGSERIAL       NOT NULL,
    tenant_id   BIGINT          NOT NULL,
    user_id     BIGINT          NOT NULL,
    title       VARCHAR(255)    NOT NULL,
    description TEXT            NOT NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_feature_suggestions PRIMARY KEY (id)
);

CREATE INDEX idx_feature_suggestions_tenant_id   ON feature_suggestions (tenant_id);
CREATE INDEX idx_feature_suggestions_tenant_user ON feature_suggestions (tenant_id, user_id);