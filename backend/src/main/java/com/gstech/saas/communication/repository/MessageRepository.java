package com.gstech.saas.communication.repository;

import com.gstech.saas.communication.dto.Channel;
import com.gstech.saas.communication.dto.MessageStatus;
import com.gstech.saas.communication.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message,Long> {

    /**
     * List all messages for the current tenant by channel.
     * Sorted by createdAt DESC (passed via Pageable) so DRAFT messages
     * that have no sentAt/scheduledAt still appear in the correct order.
     */
    Page<Message> findByTenantIdAndType(Long tenantId, Channel type, Pageable pageable);

    /** Scheduler query: find all SCHEDULED messages whose time has arrived */
    List<Message> findByStatusAndScheduledAtBefore(
            MessageStatus status, Instant now);
}
