package com.gstech.saas.communication.dto;

public enum RecipientType {

    ALL_OWNERS,
    ALL_RESIDENTS,
    BOARD_MEMBERS,
    OWNER;

    public static RecipientType from(String type) {
        try {
            return RecipientType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid recipient type: " + type);
        }
    }
}
