package com.gstech.saas.platform.exception;

import org.springframework.http.HttpStatus;

public class BillAttachmentExceptions extends RuntimeException {

    private final HttpStatus statusCode;

    public BillAttachmentExceptions(HttpStatus statusCode, String message) {
        super(message);
        this.statusCode = statusCode;
    }

    public HttpStatus getStatusCode() {
        return statusCode;
    }

    public static BillAttachmentExceptions limitExceeded(int max) {
        return new BillAttachmentExceptions(
                HttpStatus.UNPROCESSABLE_ENTITY,
                "Maximum " + max + " attachments allowed per bill"
        );
    }

    public static BillAttachmentExceptions fileTooLarge(long maxMb) {
        return new BillAttachmentExceptions(
                HttpStatus.UNPROCESSABLE_ENTITY,
                "File size exceeds the maximum allowed size of " + maxMb + "MB"
        );
    }

    public static BillAttachmentExceptions unsupportedType(String contentType) {
        return new BillAttachmentExceptions(
                HttpStatus.UNPROCESSABLE_ENTITY,
                "Unsupported file type '" + contentType + "'. Allowed: PDF, PNG, JPG"
        );
    }

    public static BillAttachmentExceptions notFound(Long id) {
        return new BillAttachmentExceptions(
                HttpStatus.NOT_FOUND,
                "Attachment not found with id: " + id
        );
    }

    public static BillAttachmentExceptions storageFailure(String reason) {
        return new BillAttachmentExceptions(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Failed to store file: " + reason
        );
    }
}