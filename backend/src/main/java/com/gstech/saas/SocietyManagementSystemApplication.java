package com.gstech.saas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
@EnableJpaAuditing
public class SocietyManagementSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(SocietyManagementSystemApplication.class, args);
	}

}
