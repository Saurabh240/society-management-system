package com.gstech.saas.communication.repository;

import com.gstech.saas.communication.dto.Level;
import com.gstech.saas.communication.dto.TemplateResponse;
import com.gstech.saas.communication.model.CommunicationTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TemplateRepository extends JpaRepository<CommunicationTemplate,Long> {
    Page<CommunicationTemplate> findByLevel(Level level, Pageable pageable);
    List<CommunicationTemplate> findByLevel(Level level);

}
