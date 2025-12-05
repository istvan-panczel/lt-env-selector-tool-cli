import { AES } from 'crypto-es';
import type { SelectionData } from './types';

export function encryptData(data: SelectionData, password: string): string {
  const dataToEncrypt = {
    company: data.company,
    env: data.env,
    url: data.url,
  };

  return AES.encrypt(JSON.stringify(dataToEncrypt), password).toString();
}
