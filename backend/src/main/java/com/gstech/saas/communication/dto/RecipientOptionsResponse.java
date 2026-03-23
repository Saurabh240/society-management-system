package com.gstech.saas.communication.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class RecipientOptionsResponse {

    private List<AssociationOption> associations;

    /**
     * Owners for a specific association — only populated when
     * ?associationId= is passed. Null on the initial load.
     */
    private List<OwnerOption> owners;

    private List<VendorOption> vendors;

    // ── Nested option types ───────────────────────────────

    @Data
    @Builder
    public static class AssociationOption {
        private Long id;
        private String name;
        private int ownerCount;
    }

    @Data
    @Builder
    public static class OwnerOption {
        private Long ownerId;
        private String name;
        private String unitNumber;
        private String email;
        private String phone;
    }

    @Data
    @Builder
    public static class VendorOption {
        private Long vendorId;
        private String companyName;
        private String contactName;
        private String email;
        private String phone;
    }
}