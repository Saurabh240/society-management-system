package com.gstech.saas.communication.engine;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Replaces {{variable}} placeholders. Tolerant of whitespace ({{ ownerName }}) and of
 * differing letter case ({{OwnerName}}). Placeholders with no known value are left
 * untouched so an admin can see what was not resolved.
 */
@Component
public class TemplateEngine {

    private static final Pattern PLACEHOLDER = Pattern.compile("\\{\\{\\s*([A-Za-z0-9_.]+)\\s*\\}\\}");

    public String process(String template, Map<String, String> variables) {
        if (template == null || variables == null) return template;

        // case-insensitive lookup
        Map<String, String> lookup = new java.util.HashMap<>();
        variables.forEach((k, v) -> { if (k != null) lookup.put(k.toLowerCase(), v == null ? "" : v); });

        Matcher m = PLACEHOLDER.matcher(template);
        StringBuilder out = new StringBuilder();
        while (m.find()) {
            String value = lookup.get(m.group(1).toLowerCase());
            m.appendReplacement(out, Matcher.quoteReplacement(value != null ? value : m.group()));
        }
        m.appendTail(out);
        return out.toString();
    }
}