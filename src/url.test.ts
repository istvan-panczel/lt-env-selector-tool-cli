import { describe, expect, test } from 'bun:test';
import { stripMajorVersion } from './url';

describe('stripMajorVersion', () => {
  test('removes single digit version', () => {
    expect(stripMajorVersion('https://foo.bar.com/api/v5')).toBe('https://foo.bar.com/api');
  });

  test('removes double digit version', () => {
    expect(stripMajorVersion('https://example.com/api/v10')).toBe('https://example.com/api');
  });

  test('removes triple digit version', () => {
    expect(stripMajorVersion('https://example.com/api/v123')).toBe('https://example.com/api');
  });

  test('returns unchanged URL without version suffix', () => {
    expect(stripMajorVersion('https://example.com/api')).toBe('https://example.com/api');
  });

  test('does not remove version in middle of path', () => {
    expect(stripMajorVersion('https://example.com/v5/api/users')).toBe('https://example.com/v5/api/users');
  });

  test('does not remove version with trailing slash', () => {
    expect(stripMajorVersion('https://example.com/api/v5/')).toBe('https://example.com/api/v5/');
  });

  test('handles URL with query parameters after version', () => {
    // Note: version must be at the end, so this should not strip
    expect(stripMajorVersion('https://example.com/api/v5?foo=bar')).toBe('https://example.com/api/v5?foo=bar');
  });

  test('handles v1 version', () => {
    expect(stripMajorVersion('https://example.com/api/v1')).toBe('https://example.com/api');
  });

  test('handles empty string', () => {
    expect(stripMajorVersion('')).toBe('');
  });

  test('handles URL with only version path', () => {
    expect(stripMajorVersion('https://example.com/v5')).toBe('https://example.com');
  });
});
