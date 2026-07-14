package com.gstech.saas.accounting.reports.dto;

import java.util.List;

public record UnitOccupancyResponse(
        String period,
        int totalUnits,
        int occupiedUnits,
        int vacantUnits,
        double occupancyRate,
        List<UnitOccupancyRow> units
) {}

