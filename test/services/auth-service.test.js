// @ts-check
import { describe, it, expect } from 'vitest';
import { AuthService } from '../../src/services/auth-service.js';

describe('AuthService', () => {
  describe('_normalizeError', () => {
    const svc = new AuthService();

    it('maps 401 to SESSION_EXPIRED (not retryable)', () => {
      const err = svc._normalizeError(401, {});
      expect(err.errorCode).toBe('SESSION_EXPIRED');
      expect(err.retryable).toBe(false);
    });

    it('maps 403 to SESSION_EXPIRED (not retryable)', () => {
      const err = svc._normalizeError(403, {});
      expect(err.errorCode).toBe('SESSION_EXPIRED');
      expect(err.retryable).toBe(false);
    });

    it('maps 500+ to AUTH_SERVER_ERROR (retryable)', () => {
      const err = svc._normalizeError(502, {});
      expect(err.errorCode).toBe('AUTH_SERVER_ERROR');
      expect(err.retryable).toBe(true);
    });

    it('maps other codes to GENERIC_AUTH_ERROR with message', () => {
      const err = svc._normalizeError(422, { message: 'Invalid token format' });
      expect(err.errorCode).toBe('GENERIC_AUTH_ERROR');
      expect(err.retryable).toBe(true);
      expect(err.message).toBe('Invalid token format');
    });
  });
});
