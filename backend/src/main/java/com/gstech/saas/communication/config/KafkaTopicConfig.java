package com.gstech.saas.communication.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

/**
 * Ensures all required Kafka topics exist on startup.
 * Spring Boot auto-creates them via KafkaAdmin if they don't exist yet.
 */
@Configuration
public class KafkaTopicConfig {

    @Bean
    public NewTopic communicationSendTopic() {
        return TopicBuilder.name("communication.send")
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic communicationRetryTopic() {
        return TopicBuilder.name("communication.retry")
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic communicationDlqTopic() {
        return TopicBuilder.name("communication.dlq")
                .partitions(1)
                .replicas(1)
                .build();
    }
}