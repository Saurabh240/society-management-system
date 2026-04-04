package com.gstech.saas.communication.repository;

import com.gstech.saas.communication.model.Delivery;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.List;

public interface DeliveryRepository extends JpaRepository<Delivery,Long> {

    List<Delivery> findByMessageId(Long messageId);

    @Modifying
    @Transactional
    void deleteByMessageIdIn(List<Long> messageIds);

}
