package com.gstech.saas.communication.repository;

import com.gstech.saas.communication.model.MailingRecipient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MailingRecipientRepository extends JpaRepository<MailingRecipient, Long> {

    List<MailingRecipient> findByMessageId(Long messageId);

    void deleteByMessageId(Long messageId);
}