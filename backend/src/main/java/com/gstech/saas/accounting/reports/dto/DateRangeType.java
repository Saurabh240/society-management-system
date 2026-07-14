package com.gstech.saas.accounting.reports.dto;

import java.time.LocalDate;
import java.time.YearMonth;

/**
 * Predefined date ranges for financial reports
 */
public enum DateRangeType {
    THIS_QUARTER {
        @Override
        public LocalDate[] getDateRange(LocalDate referenceDate) {
            LocalDate now = referenceDate != null ? referenceDate : LocalDate.now();
            int quarter = (now.getMonthValue() - 1) / 3;
            LocalDate start = now.withMonth(quarter * 3 + 1).withDayOfMonth(1);
            LocalDate end = start.plusMonths(3).minusDays(1);
            return new LocalDate[]{start, end};
        }
    },
    LAST_QUARTER {
        @Override
        public LocalDate[] getDateRange(LocalDate referenceDate) {
            LocalDate now = referenceDate != null ? referenceDate : LocalDate.now();
            int quarter = (now.getMonthValue() - 1) / 3;
            quarter = quarter == 0 ? 3 : quarter - 1; // Previous quarter
            LocalDate start = now.withYear((quarter == 3) ? now.getYear() - 1 : now.getYear())
                    .withMonth(quarter * 3 + 1).withDayOfMonth(1);
            LocalDate end = start.plusMonths(3).minusDays(1);
            return new LocalDate[]{start, end};
        }
    },
    THIS_YEAR {
        @Override
        public LocalDate[] getDateRange(LocalDate referenceDate) {
            LocalDate now = referenceDate != null ? referenceDate : LocalDate.now();
            LocalDate start = now.withDayOfYear(1);
            LocalDate end = now.withDayOfYear(now.lengthOfYear());
            return new LocalDate[]{start, end};
        }
    },
    LAST_YEAR {
        @Override
        public LocalDate[] getDateRange(LocalDate referenceDate) {
            LocalDate now = referenceDate != null ? referenceDate : LocalDate.now();
            LocalDate lastYear = now.minusYears(1);
            LocalDate start = lastYear.withDayOfYear(1);
            LocalDate end = lastYear.withDayOfYear(lastYear.lengthOfYear());
            return new LocalDate[]{start, end};
        }
    },
    CUSTOM {
        @Override
        public LocalDate[] getDateRange(LocalDate referenceDate) {
            throw new IllegalStateException("CUSTOM requires explicit from and to dates");
        }
    };

    public abstract LocalDate[] getDateRange(LocalDate referenceDate);
}

