package com.gstech.saas.accounting.reports.dto;

public record UnitOccupancyRow(
        Long unitId,
        String unitNumber,
        String ownerName,
        String ownerEmail,
        String occupancyStatus
) {}

