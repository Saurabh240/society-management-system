package com.gstech.saas.platform.common;

public final class UsState {

    private UsState() {}

    // 50 states + DC + USPS territories (AS, FM, GU, MH, MP, PW, PR, VI)
    public static final String REGEX =
            "^(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|" +
                    "NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|" +
                    "DC|AS|FM|GU|MH|MP|PW|PR|VI)$";

    public static final String MESSAGE = "State must be a valid 2-letter US state/territory code";
}