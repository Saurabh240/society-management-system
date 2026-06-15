package com.gstech.saas.platform.help.repository;

import com.gstech.saas.platform.help.model.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    List<SupportTicket> findByTenantIdOrderByCreatedAtDesc(Long tenantId);
    List<SupportTicket> findByTenantIdAndUserIdOrderByCreatedAtDesc(Long tenantId, Long userId);
}