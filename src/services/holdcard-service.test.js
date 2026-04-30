// @ts-check
import { describe, it, expect } from 'vitest';
import { HoldcardService } from './holdcard-service.js';

describe('HoldcardService', () => {
  describe('_normalizeError', () => {
    const svc = new HoldcardService();

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

    it('maps 408 to TIMEOUT (retryable)', () => {
      const err = svc._normalizeError(408, {});
      expect(err.errorCode).toBe('TIMEOUT');
      expect(err.retryable).toBe(true);
    });

    it('maps 504 to TIMEOUT (retryable)', () => {
      const err = svc._normalizeError(504, {});
      expect(err.errorCode).toBe('TIMEOUT');
      expect(err.retryable).toBe(true);
    });

    it('maps 500 to GENERIC_ERROR (retryable)', () => {
      const err = svc._normalizeError(500, {});
      expect(err.errorCode).toBe('GENERIC_ERROR');
      expect(err.retryable).toBe(true);
    });

    it('preserves errorCode from response body when present', () => {
      const err = svc._normalizeError(500, { errorCode: 'RATE_LIMITED' });
      expect(err.errorCode).toBe('RATE_LIMITED');
    });

    it('defaults to GENERIC_ERROR when body is empty', () => {
      const err = svc._normalizeError(503, {});
      expect(err.errorCode).toBe('GENERIC_ERROR');
    });
  });
});
