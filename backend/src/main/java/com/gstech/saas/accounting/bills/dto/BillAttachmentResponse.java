package com.gstech.saas.accounting.bills.dto;

import java.time.Instant;

public record BillAttachmentResponse(
        Long id,
        Long billId,
        String originalFilename,
        String contentType,
        Long fileSize,
        String fileSizeFormatted,
        Instant createdAt
) {}