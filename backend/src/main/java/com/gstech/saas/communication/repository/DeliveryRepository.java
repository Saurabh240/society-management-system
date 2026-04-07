package com.gstech.saas.communication.repository;

import com.gstech.saas.communication.model.Delivery;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery,Long> {

    List<Delivery> findByMessageId(Long messageId);

    @Modifying
    @Transactional
    void deleteByMessageIdIn(List<Long> messageIds);

}
