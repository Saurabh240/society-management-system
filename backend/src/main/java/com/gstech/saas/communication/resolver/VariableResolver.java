package com.gstech.saas.communication.resolver;

import com.gstech.saas.communication.model.Delivery;
import com.gstech.saas.communication.model.Message;

import java.util.Map;

/**
 * Strategy interface for contributing template variable values at send time.
 * Add a new Spring bean implementing this interface to support additional
 * variable sources (e.g. accounting, maintenance) without modifying providers.
 */
public interface VariableResolver {

    /**
     * Returns a map of variable name → value for the given delivery+message context.
     * Return an empty map (never null) if this resolver has nothing to contribute.
     */
    Map<String, String> resolve(Delivery delivery, Message message);
}