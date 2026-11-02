package com.gstech.saas.platform.common;

/**
 * Header / request-attribute names.
 * Constants are explicitly static so they can be used inside annotations
 * (e.g. @RequestAttribute) - Lombok's @UtilityClass makes members static only after
 * javac has already resolved annotation values, which breaks clean CI builds.
 */
public final class HeaderConstant {

    public static final String USER_ID_HEADER_KEY = "x-user-id";

    private HeaderConstant() {
    }
}
