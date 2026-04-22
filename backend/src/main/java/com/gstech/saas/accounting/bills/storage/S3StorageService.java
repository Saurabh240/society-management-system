package com.gstech.saas.accounting.bills.storage;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * S3 storage — placeholder for future implementation.
 * Active when: app.storage.provider=s3
 *
 * To implement later:
 *  1. Add AWS SDK dependency to pom.xml
 *  2. Replace the UnsupportedOperationException bodies with real S3 calls
 *  3. Add S3 config to application.yml (bucket-name, region)
 */
@Service
@ConditionalOnProperty(
        name        = "app.storage.provider",
        havingValue = "s3"
)
public class S3StorageService implements StorageService {

    @Override
    public String store(MultipartFile file, String subFolder) {
        throw new UnsupportedOperationException("S3 storage not yet implemented");
    }

    @Override
    public Resource load(String storageKey) {
        throw new UnsupportedOperationException("S3 storage not yet implemented");
    }

    @Override
    public void delete(String storageKey) {
        throw new UnsupportedOperationException("S3 storage not yet implemented");
    }
}