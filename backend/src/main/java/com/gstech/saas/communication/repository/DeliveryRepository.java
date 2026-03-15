package com.gstech.saas.communication.repository;

import com.gstech.saas.communication.model.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeliveryRepository extends JpaRepository<Delivery,Long> {

    List<Delivery> findByMessageId(Long messageId);

}
