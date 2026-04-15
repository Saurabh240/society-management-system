package com.gstech.saas.accounting.ledger.specification;

import com.gstech.saas.accounting.ledger.dto.AccountingBasis;
import com.gstech.saas.accounting.ledger.model.Ledger;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class LedgerSpecification {

    private LedgerSpecification() {}

    public static Specification<Ledger> withFilters(
            Long tenantId,
            Long associationId,
            List<Long> accountIds,
            LocalDate from,
            LocalDate to,
            AccountingBasis basis) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // tenantId is always required
            predicates.add(cb.equal(root.get("tenantId"), tenantId));

            // each optional filter only added when non-null → PostgreSQL never
            // sees a null typed parameter, which caused the "could not determine
            // data type" error when using IS NULL in a single @Query
            if (associationId != null) {
                predicates.add(cb.equal(root.get("associationId"), associationId));
            }
            if (accountIds != null && !accountIds.isEmpty()) {
                predicates.add(root.get("accountId").in(accountIds));
            }
            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("date"), from));
            }
            if (to != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("date"), to));
            }
            if (basis != null) {
                predicates.add(cb.equal(root.get("accountingBasis"), basis));
            }

            // consistent ordering: newest date first, then by id descending
            query.orderBy(
                    cb.desc(root.get("date")),
                    cb.desc(root.get("id"))
            );

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}