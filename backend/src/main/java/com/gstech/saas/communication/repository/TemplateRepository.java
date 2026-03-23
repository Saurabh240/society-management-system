package com.gstech.saas.communication.repository;

import com.gstech.saas.communication.dto.Level;
import com.gstech.saas.communication.model.CommunicationTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TemplateRepository extends JpaRepository<CommunicationTemplate,Long> {
    List<CommunicationTemplate> findByLevel(Level level);
}
