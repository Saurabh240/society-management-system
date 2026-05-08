package com.gstech.saas.associations.help.repository;

import com.gstech.saas.associations.help.model.FeatureSuggestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeatureSuggestionRepository extends JpaRepository<FeatureSuggestion, Long> {
    List<FeatureSuggestion> findByTenantIdOrderByCreatedAtDesc(Long tenantId);
}