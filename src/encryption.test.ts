import { describe, expect, test } from 'bun:test';
import { AES, Utf8 } from 'crypto-es';
import { encryptData } from './encryption';
import type { SelectionData } from './types';

describe('encryptData', () => {
  test('encrypt and decrypt roundtrip produces original data', () => {
    const data: SelectionData = {
      company: 'TestCompany',
      env: 'dev',
      url: 'https://api.example.com',
    };
    const password = 'test-password';

    const encrypted = encryptData(data, password);
    const decrypted = AES.decrypt(encrypted, password).toString(Utf8);
    const parsed = JSON.parse(decrypted);

    expect(parsed).toEqual(data);
  });

  test('handles special characters in passwords', () => {
    const data: SelectionData = {
      company: 'TestCompany',
      env: 'uat',
      url: 'https://api.example.com',
    };
    const password = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    const encrypted = encryptData(data, password);
    const decrypted = AES.decrypt(encrypted, password).toString(Utf8);
    const parsed = JSON.parse(decrypted);

    expect(parsed).toEqual(data);
  });

  test('handles unicode in data', () => {
    const data: SelectionData = {
      company: 'Tëst Cömpäny 日本語',
      env: 'prod',
      url: 'https://api.例え.com/路径',
    };
    const password = 'test-password';

    const encrypted = encryptData(data, password);
    const decrypted = AES.decrypt(encrypted, password).toString(Utf8);
    const parsed = JSON.parse(decrypted);

    expect(parsed).toEqual(data);
  });

  test('different passwords produce different ciphertexts', () => {
    const data: SelectionData = {
      company: 'TestCompany',
      env: 'dev',
      url: 'https://api.example.com',
    };

    const encrypted1 = encryptData(data, 'password1');
    const encrypted2 = encryptData(data, 'password2');

    expect(encrypted1).not.toBe(encrypted2);
  });
});
