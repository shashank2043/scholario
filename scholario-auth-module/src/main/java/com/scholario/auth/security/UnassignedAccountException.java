package com.scholario.auth.security;

import org.springframework.security.access.AccessDeniedException;

/**
 * Exception thrown when a user with only the UNASSIGNED role tries to access protected resources.
 */
public class UnassignedAccountException extends AccessDeniedException {
    public UnassignedAccountException(String msg) {
        super(msg);
    }
}
