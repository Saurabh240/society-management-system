package com.gstech.saas.accounting.bills.service;

import com.gstech.saas.accounting.bills.dto.BillAttachmentResponse;
import com.gstech.saas.accounting.bills.model.BillAttachment;
import com.gstech.saas.accounting.bills.repository.BillAttachmentRepository;
import com.gstech.saas.platform.exception.BillAttachmentExceptions;
import com.gstech.saas.accounting.bills.storage.StorageService;   // ← interface, not a concrete class
import com.gstech.saas.platform.tenant.multitenancy.TenantContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class BillAttachmentService {

    private static final int         MAX_FILES      = 5;
    private static final long        MAX_SIZE_BYTES = 10L * 1024 * 1024; // 10 MB
    private static final Set<String> ALLOWED_TYPES  = Set.of(
            "application/pdf", "image/png", "image/jpeg"
    );

    private final BillAttachmentRepository attachmentRepository;
    private final StorageService           storageService;  // ← injected by Spring based on provider flag

    // ─────────────────────────────────────────────────────────────────────────
    // UPLOAD
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public BillAttachmentResponse upload(Long billId, MultipartFile file) {
        Long tenantId = TenantContext.get();

        // 1. Max 5 files per bill
        long existing = attachmentRepository.countByBillIdAndTenantId(billId, tenantId);
        if (existing >= MAX_FILES) {
            throw BillAttachmentExceptions.limitExceeded(MAX_FILES);
        }

        // 2. Max 10 MB
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw BillAttachmentExceptions.fileTooLarge(10L);
        }

        // 3. Only PDF / PNG / JPG
        String contentType = resolveContentType(file);
        if (!ALLOWED_TYPES.contains(contentType)) {
            throw BillAttachmentExceptions.unsupportedType(contentType);
        }

        // 4. Delegate to whichever StorageService is active (local or S3)
        //    storageService.store() returns an opaque key saved in DB
        String storageKey = storageService.store(file, "bills/" + billId);

        // 5. Save metadata in DB
        BillAttachment attachment = new BillAttachment();
        attachment.setTenantId(tenantId);
        attachment.setBillId(billId);
        attachment.setOriginalFilename(file.getOriginalFilename());
        attachment.setStoredPath(storageKey);       // local: relative path | S3: object key
        attachment.setContentType(contentType);
        attachment.setFileSize(file.getSize());

        return toResponse(attachmentRepository.save(attachment));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LIST
    // ─────────────────────────────────────────────────────────────────────────

    public List<BillAttachmentResponse> listAttachments(Long billId) {
        Long tenantId = TenantContext.get();
        return attachmentRepository.findByBillIdAndTenantId(billId, tenantId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DOWNLOAD
    // ─────────────────────────────────────────────────────────────────────────

    public Resource download(Long billId, Long attachmentId) {
        Long tenantId = TenantContext.get();
        BillAttachment attachment = attachmentRepository
                .findByIdAndBillIdAndTenantId(attachmentId, billId, tenantId)
                .orElseThrow(() -> BillAttachmentExceptions.notFound(attachmentId));
        return storageService.load(attachment.getStoredPath());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    /** Maps entity → response. All mapping logic lives here, record stays clean. */
    private BillAttachmentResponse toResponse(BillAttachment a) {
        return new BillAttachmentResponse(
                a.getId(),
                a.getBillId(),
                a.getOriginalFilename(),
                a.getContentType(),
                a.getFileSize(),
                formatSize(a.getFileSize()),
                a.getCreatedAt()
        );
    }

    private String formatSize(long bytes) {
        if (bytes < 1024)        return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        return String.format("%.1f MB", bytes / (1024.0 * 1024));
    }

    /** Resolves by file extension — more reliable than trusting the declared Content-Type header */
    private String resolveContentType(MultipartFile file) {
        String name = file.getOriginalFilename();
        if (name != null) {
            String lower = name.toLowerCase();
            if (lower.endsWith(".pdf"))                             return "application/pdf";
            if (lower.endsWith(".png"))                             return "image/png";
            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg"))  return "image/jpeg";
        }
        return file.getContentType() != null ? file.getContentType() : "application/octet-stream";
    }
}