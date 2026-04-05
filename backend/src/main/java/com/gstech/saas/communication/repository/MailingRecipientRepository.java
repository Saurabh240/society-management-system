package com.gstech.saas.communication.repository;

import com.gstech.saas.communication.model.MailingRecipient;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MailingRecipientRepository extends JpaRepository<MailingRecipient, Long> {

    List<MailingRecipient> findByMessageId(Long messageId);

    @Modifying
    @Transactional
    void deleteByMessageId(Long messageId);

    @Modifying
    @Transactional
    void deleteByMessageIdIn(List<Long> messageIds);
}