package com.gstech.saas.communication.repository;

import com.gstech.saas.communication.model.CommunicationTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TemplateRepository extends JpaRepository<CommunicationTemplate,Long> {}
