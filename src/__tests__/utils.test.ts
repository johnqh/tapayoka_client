import { describe, it, expect } from 'vitest';
import {
  buildUrl,
  getErrorMessage,
  createAuthHeaders,
  createHeaders,
  TapayokaApiError,
  handleApiError,
} from '../utils/index';

describe('buildUrl', () => {
  it('joins base and segments', () => {
    expect(buildUrl('https://api.example.com', 'v1', 'devices')).toBe(
      'https://api.example.com/v1/devices'
    );
  });

  it('strips trailing slashes from base', () => {
    expect(buildUrl('https://api.example.com/', 'devices')).toBe(
      'https://api.example.com/devices'
    );
  });

  it('strips leading/trailing slashes from segments', () => {
    expect(buildUrl('https://api.example.com', '/v1/', '/orders/')).toBe(
      'https://api.example.com/v1/orders'
    );
  });

  it('handles single segment', () => {
    expect(buildUrl('https://api.example.com', 'health')).toBe(
      'https://api.example.com/health'
    );
  });
});

describe('getErrorMessage', () => {
  it('extracts message from Error', () => {
    expect(getErrorMessage(new Error('test error'))).toBe('test error');
  });

  it('returns string directly', () => {
    expect(getErrorMessage('string error')).toBe('string error');
  });

  it('returns fallback for unknown types', () => {
    expect(getErrorMessage(42)).toBe('An error occurred');
  });

  it('uses custom fallback', () => {
    expect(getErrorMessage(null, 'custom fallback')).toBe('custom fallback');
  });
});

describe('createAuthHeaders', () => {
  it('creates headers with bearer token', () => {
    const headers = createAuthHeaders('my-token');
    expect(headers).toEqual({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer my-token',
    });
  });
});

describe('createHeaders', () => {
  it('creates standard headers without auth', () => {
    const headers = createHeaders();
    expect(headers).toEqual({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
    expect(headers).not.toHaveProperty('Authorization');
  });
});

describe('TapayokaApiError', () => {
  it('has correct name', () => {
    const err = new TapayokaApiError('test');
    expect(err.name).toBe('TapayokaApiError');
    expect(err.message).toBe('test');
  });

  it('stores statusCode and errorCode', () => {
    const err = new TapayokaApiError('fail', {
      statusCode: 404,
      errorCode: 'NOT_FOUND',
      details: 'Resource missing',
    });
    expect(err.statusCode).toBe(404);
    expect(err.errorCode).toBe('NOT_FOUND');
    expect(err.details).toBe('Resource missing');
  });

  it('is an instance of Error', () => {
    const err = new TapayokaApiError('test');
    expect(err).toBeInstanceOf(Error);
  });
});

describe('handleApiError', () => {
  it('extracts error from response', () => {
    const response = {
      status: 400,
      data: { error: 'Bad request', code: 'VALIDATION' },
    };
    const err = handleApiError(response, 'create device');
    expect(err.message).toBe('Failed to create device: Bad request');
    expect(err.statusCode).toBe(400);
    expect(err.errorCode).toBe('VALIDATION');
  });

  it('falls back to Unknown error', () => {
    const err = handleApiError({}, 'do something');
    expect(err.message).toBe('Failed to do something: Unknown error');
  });
});
