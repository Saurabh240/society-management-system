package com.gstech.saas.accounting.bills.storage;

import com.gstech.saas.platform.exception.BillAttachmentExceptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.UUID;

/**
 * Local disk storage implementation.
 * Active when: app.storage.provider=local (or when the property is not set at all).
 *
 * Files are stored at: {app.storage.upload-dir}/bills/{billId}/{uuid_filename}
 * Example:  uploads/bills/42/3f2e1d_invoice.pdf
 */
@Slf4j
@Service
@ConditionalOnProperty(
        name    = "app.storage.provider",
        havingValue = "local",
        matchIfMissing = true   // ← local is the DEFAULT if property is not set
)
public class LocalStorageService implements StorageService {

    private final Path rootLocation;

    public LocalStorageService(
            @Value("${app.storage.upload-dir:uploads}") String uploadDir) {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(rootLocation);
            log.info("Local storage initialised at: {}", rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialise local storage at: " + uploadDir, e);
        }
    }

    @Override
    public String store(MultipartFile file, String subFolder) {
        String sanitised    = sanitise(file.getOriginalFilename());
        String shortUuid    = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        String storedName   = shortUuid + "_" + sanitised;
        String relativePath = subFolder + "/" + storedName;

        try {
            Path targetDir = rootLocation.resolve(subFolder);
            Files.createDirectories(targetDir);
            Files.copy(file.getInputStream(),
                    targetDir.resolve(storedName),
                    StandardCopyOption.REPLACE_EXISTING);
            log.info("[LOCAL] Stored: {}", relativePath);
            return relativePath;
        } catch (IOException e) {
            log.error("[LOCAL] Failed to store {}: {}", relativePath, e.getMessage());
            throw BillAttachmentExceptions.storageFailure(e.getMessage());
        }
    }

    @Override
    public Resource load(String storageKey) {
        try {
            Path filePath = rootLocation.resolve(storageKey).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) return resource;
            throw BillAttachmentExceptions.notFound(-1L);
        } catch (MalformedURLException e) {
            throw BillAttachmentExceptions.storageFailure(e.getMessage());
        }
    }

    @Override
    public void delete(String storageKey) {
        try {
            Files.deleteIfExists(rootLocation.resolve(storageKey).normalize());
            log.info("[LOCAL] Deleted: {}", storageKey);
        } catch (IOException e) {
            log.warn("[LOCAL] Could not delete {}: {}", storageKey, e.getMessage());
        }
    }

    private String sanitise(String filename) {
        if (filename == null || filename.isBlank()) return "file";
        return Paths.get(filename).getFileName().toString()
                .replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}