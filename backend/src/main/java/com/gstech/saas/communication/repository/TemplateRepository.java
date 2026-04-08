package com.gstech.saas.communication.repository;

import com.gstech.saas.communication.dto.Level;
import com.gstech.saas.communication.dto.TemplateResponse;
import com.gstech.saas.communication.model.CommunicationTemplate;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TemplateRepository extends JpaRepository<CommunicationTemplate,Long> {
    // Paginated
    Page<CommunicationTemplate> findByTenantId(Long tenantId, Pageable pageable);
    Page<CommunicationTemplate> findByTenantIdAndLevel(Long tenantId, Level level, Pageable pageable);

    // Unpaginated
    List<CommunicationTemplate> findByTenantId(Long tenantId);
    List<CommunicationTemplate> findByTenantIdAndLevel(Long tenantId, Level level);

    // Single fetch — scoped
    Optional<CommunicationTemplate> findByIdAndTenantId(Long id, Long tenantId);

    // Delete — scoped
    @Modifying
    @Transactional
    @Query("DELETE FROM CommunicationTemplate t WHERE t.id IN :ids AND t.tenantId = :tenantId")
    void deleteByIdsAndTenantId(@Param("ids") List<Long> ids, @Param("tenantId") Long tenantId);

    @Modifying
    @Transactional
    @Query("DELETE FROM CommunicationTemplate t WHERE t.id = :id AND t.tenantId = :tenantId")
    void deleteByIdAndTenantId(@Param("id") Long id, @Param("tenantId") Long tenantId);

}
