package com.gstech.saas.associations.vendor.service;

import com.gstech.saas.associations.vendor.dtos.VendorRequest;
import com.gstech.saas.associations.vendor.dtos.VendorResponse;

import java.util.List;

public interface VendorService {

    VendorResponse createVendor(VendorRequest request);

    VendorResponse updateVendor(Long id, VendorRequest request);

    VendorResponse getVendorById(Long id);

    /** Active vendors of the current tenant, as DTOs (never the lazy-proxy-laden entity). */
    List<VendorResponse> listActiveVendors();

    void deleteVendor(Long id);

    void deleteBatch(List<Long> ids);
}