export interface UrlOption {
  value: string;
  label: string;
}

export interface BuildVersionInfo {
  version: string;
  serverId: string;
  serverEnv: string;
  dbVersion: string;
  dateTime: string;
}

// Company is now a dynamic string from build-time config
export type Company = string;

export type Environment = 'dev' | 'uat' | 'prod';

export interface SelectionData {
  company: Company;
  env: Environment;
  url: string;
}

export interface Config {
  url: string;
  password: string;
  companies: string[];
}

export const ENVIRONMENTS: Environment[] = ['dev', 'uat', 'prod'];

export const BACK_VALUE = '__BACK__';
export const EXIT_VALUE = '__EXIT__';
