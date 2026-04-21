package com.gstech.saas.accounting.bills.model;

import com.gstech.saas.platform.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
        name = "bill_attachments",
        indexes = {
                @Index(name = "idx_bill_attachments_bill",   columnList = "bill_id"),
                @Index(name = "idx_bill_attachments_tenant", columnList = "tenant_id, bill_id")
        }
)
@Getter
@Setter
public class BillAttachment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bill_id", nullable = false)
    private Long billId;

    /** Original filename shown in the UI */
    @Column(name = "original_filename", nullable = false, length = 255)
    private String originalFilename;

    /** Relative path on disk — e.g. "bills/42/abc1234_invoice.pdf" */
    @Column(name = "stored_path", nullable = false, length = 500)
    private String storedPath;

    /** MIME type: application/pdf | image/png | image/jpeg */
    @Column(name = "content_type", nullable = false, length = 50)
    private String contentType;

    /** File size in bytes */
    @Column(name = "file_size", nullable = false)
    private Long fileSize;
}