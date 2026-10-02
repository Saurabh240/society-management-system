package com.gstech.saas.communication.repository;

import com.gstech.saas.communication.model.Delivery;
import com.gstech.saas.communication.dto.DeliveryStatus;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery,Long> {

    List<Delivery> findByMessageId(Long messageId);

    /**
     * Count deliveries by status for a given message.
     * Used to generate delivery status summary.
     */
    Long countByMessageIdAndStatus(Long messageId, DeliveryStatus status);

    /**
     * Get all deliveries for a message that are in failed or DLQ state.
     * Used to provide error details in the response.
     */
    @Query("SELECT d FROM Delivery d WHERE d.messageId = :messageId AND (d.status = 'FAILED' OR d.status = 'DLQ')")
    List<Delivery> findFailedDeliveriesByMessageId(@Param("messageId") Long messageId);

    @Modifying
    @Transactional
    void deleteByMessageIdIn(List<Long> messageIds);

}
