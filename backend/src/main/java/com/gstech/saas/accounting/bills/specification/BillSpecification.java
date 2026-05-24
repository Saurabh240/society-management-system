package com.gstech.saas.accounting.bills.specification;

import com.gstech.saas.accounting.bills.model.Bill;
import com.gstech.saas.accounting.bills.model.BillStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Criteria-based bill filtering.
 * Replaces the JPQL IS NULL OR pattern in BillRepository.findFiltered()
 * which caused PostgreSQL type-inference errors on null Long/enum params.
 * Criteria API predicates are only added when the param is non-null,
 * so PostgreSQL never receives a typed null it cannot resolve.
 */
public class BillSpecification {

    private BillSpecification() {}

    /**
     * Builds a Specification that filters Bills by:
     *
     * @param tenantId      required — always applied
     * @param associationId optional — skipped when null
     * @param status        optional — skipped when null
     * @param from          optional — bills with issueDate >= from
     * @param to            optional — bills with issueDate <= to
     */
    public static Specification<Bill> withFilters(
            Long tenantId,
            Long associationId,
            BillStatus status,
            LocalDate from,
            LocalDate to) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Always filter by tenant
            predicates.add(cb.equal(root.get("tenantId"), tenantId));

            if (associationId != null) {
                predicates.add(cb.equal(root.get("associationId"), associationId));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("issueDate"), from));
            }

            if (to != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("issueDate"), to));
            }

            // Default sort: newest issue date first
            query.orderBy(
                    cb.desc(root.get("issueDate")),
                    cb.desc(root.get("id"))
            );

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}