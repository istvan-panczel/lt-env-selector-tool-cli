import { test, expect, describe } from 'bun:test';
import { parseArgs } from './config';

describe('parseArgs', () => {
  test('parses --url with space-separated value', () => {
    const result = parseArgs(['--url', 'https://example.com']);
    expect(result.url).toBe('https://example.com');
  });

  test('parses --url=value format', () => {
    const result = parseArgs(['--url=https://example.com']);
    expect(result.url).toBe('https://example.com');
  });

  test('parses --password with space-separated value', () => {
    const result = parseArgs(['--password', 'my-secret']);
    expect(result.password).toBe('my-secret');
  });

  test('parses --password=value format', () => {
    const result = parseArgs(['--password=my-secret']);
    expect(result.password).toBe('my-secret');
  });

  test('parses combined arguments', () => {
    const result = parseArgs([
      '--url',
      'https://example.com',
      '--password',
      'my-secret',
    ]);
    expect(result.url).toBe('https://example.com');
    expect(result.password).toBe('my-secret');
  });

  test('parses combined arguments with = format', () => {
    const result = parseArgs([
      '--url=https://example.com',
      '--password=my-secret',
    ]);
    expect(result.url).toBe('https://example.com');
    expect(result.password).toBe('my-secret');
  });

  test('handles --help flag', () => {
    const result = parseArgs(['--help']);
    expect(result.help).toBe(true);
  });

  test('handles -h flag', () => {
    const result = parseArgs(['-h']);
    expect(result.help).toBe(true);
  });

  test('ignores unknown arguments', () => {
    const result = parseArgs(['--unknown', 'value', '--url', 'https://example.com']);
    expect(result.url).toBe('https://example.com');
    expect(result).not.toHaveProperty('unknown');
  });

  test('returns empty object for empty args array', () => {
    const result = parseArgs([]);
    expect(result).toEqual({});
  });

  test('handles --url without value (no next arg)', () => {
    const result = parseArgs(['--url']);
    expect(result.url).toBeUndefined();
  });

  test('handles --password without value (no next arg)', () => {
    const result = parseArgs(['--password']);
    expect(result.password).toBeUndefined();
  });
});
