package com.gstech.saas.associations.vendor.service;

import com.gstech.saas.associations.vendor.dtos.VendorRequest;
import com.gstech.saas.associations.vendor.dtos.VendorResponse;

public interface VendorService {

    VendorResponse createVendor(VendorRequest request);

    VendorResponse updateVendor(Long id, VendorRequest request);

    VendorResponse getVendorById(Long id);

    void deleteVendor(Long id);
}