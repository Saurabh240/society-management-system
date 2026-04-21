package com.gstech.saas.accounting.bills.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

/**
 * Abstraction over file storage.
 * Switch between implementations via application.yml:
 *
 *   app.storage.provider: local   → LocalStorageService (default)
 *   app.storage.provider: s3      → S3StorageService
 *
 * BillAttachmentService depends only on this interface — never on a concrete class.
 */
public interface StorageService {

    /**
     * Stores a file and returns its storage key (relative path for local, S3 key for S3).
     * The returned key is what gets saved in the DB as stored_path.
     *
     * @param file      the uploaded file
     * @param subFolder logical folder, e.g. "bills/42"
     * @return storage key — opaque string, only interpreted by this same service
     */
    String store(MultipartFile file, String subFolder);

    /**
     * Loads a file as a downloadable Spring Resource.
     *
     * @param storageKey the key returned by store()
     */
    Resource load(String storageKey);

    /**
     * Deletes a file from storage.
     *
     * @param storageKey the key returned by store()
     */
    void delete(String storageKey);
}