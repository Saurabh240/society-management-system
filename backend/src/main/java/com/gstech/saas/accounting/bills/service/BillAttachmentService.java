package com.gstech.saas.accounting.bills.service;

import com.gstech.saas.accounting.bills.config.BillAttachmentProperties;
import com.gstech.saas.accounting.bills.dto.BillAttachmentResponse;
import com.gstech.saas.accounting.bills.model.BillAttachment;
import com.gstech.saas.accounting.bills.repository.BillAttachmentRepository;
import com.gstech.saas.platform.exception.BillAttachmentExceptions;
import com.gstech.saas.accounting.bills.storage.StorageService;
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

    private static final Set<String> ALLOWED_TYPES  = Set.of(
            "application/pdf", "image/png", "image/jpeg"
    );
    private final BillAttachmentProperties properties;
    private final BillAttachmentRepository attachmentRepository;
    private final StorageService           storageService;

    // ─────────────────────────────────────────────────────────────────────────
    // UPLOAD
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public BillAttachmentResponse upload(Long billId, MultipartFile file) {

        Long tenantId = TenantContext.get();
        long existing = attachmentRepository.countByBillIdAndTenantId(billId, tenantId);
        if (existing >= properties.getMaxFiles()) {
            throw BillAttachmentExceptions.limitExceeded(properties.getMaxFiles());
        }
        if (file.getSize() > properties.getMaxSizeBytes()) {
            throw BillAttachmentExceptions.fileTooLarge(properties.getMaxSizeMb());
        }
        String contentType = resolveContentType(file);

        if (!ALLOWED_TYPES.contains(contentType)) {
            throw BillAttachmentExceptions.unsupportedType(contentType);
        }
        String storageKey = storageService.store(file, "bills/" + billId);

        BillAttachment attachment = new BillAttachment();
        attachment.setTenantId(tenantId);
        attachment.setBillId(billId);
        attachment.setOriginalFilename(file.getOriginalFilename());
        attachment.setStoredPath(storageKey);
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

    private String resolveContentType(MultipartFile file) {
        String name = file.getOriginalFilename();
        if (name != null) {
            String lower = name.toLowerCase();
            if (lower.endsWith(".pdf"))
                return "application/pdf";
            if (lower.endsWith(".png"))
                return "image/png";
            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg"))
                return "image/jpeg";
        }
        return file.getContentType() != null ? file.getContentType() : "application/octet-stream";
    }
}