package com.gstech.saas.accounting.bills.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "bill.attachment")
public class BillAttachmentProperties {

    private int maxFiles;
    private long maxSizeMb;

    public long getMaxSizeBytes() {
        return maxSizeMb * 1024 * 1024;
    }
}