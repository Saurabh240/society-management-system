package com.gstech.saas.accounting.journal.specification;

import com.gstech.saas.accounting.journal.model.Journal;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class JournalSpecification {

    private JournalSpecification() {}

    public static Specification<Journal> withFilters(
            Long tenantId,
            Long associationId,
            LocalDate from,
            LocalDate to) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("tenantId"), tenantId));

            if (associationId != null) {
                predicates.add(cb.equal(root.get("associationId"), associationId));
            }
            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("date"), from));
            }
            if (to != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("date"), to));
            }

            query.orderBy(cb.desc(root.get("date")), cb.desc(root.get("id")));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}