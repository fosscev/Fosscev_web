export type SecurityEventType = 
  | 'AUTH_LOGIN_FAILED'
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_RATE_LIMIT_EXCEEDED'
  | 'POST_REMOVED'
  | 'POST_RESTORED'
  | 'FILE_UPLOAD_REJECTED';

interface SecurityEvent {
  type: SecurityEventType;
  ip?: string;
  email?: string;
  userId?: string;
  resourceId?: string;
  reason?: string;
}

/**
 * A basic structured logger for security events (Finding #17).
 * In a real production app, this would route to Pino, Winston, or Datadog.
 */
export function logSecurityEvent(event: SecurityEvent) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'WARN',
    category: 'SECURITY',
    ...event
  };

  // Convert to JSON for structured logging systems
  console.warn(JSON.stringify(logEntry));
}
