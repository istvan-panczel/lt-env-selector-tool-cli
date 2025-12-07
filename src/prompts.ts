import { confirm, select } from '@inquirer/prompts';
import type { Company, Environment, UrlOption } from './types';
import { BACK_VALUE, ENVIRONMENTS, EXIT_VALUE } from './types';

export interface UrlSelectionResult {
  action: 'exit' | 'selected';
  value?: string;
}

export interface CompanySelectionResult {
  action: 'back' | 'selected';
  value?: Company;
}

export interface EnvironmentSelectionResult {
  action: 'back' | 'selected';
  value?: Environment;
}

export interface RetryResult {
  retry: boolean;
}

export async function promptUrlSelection(options: UrlOption[]): Promise<UrlSelectionResult> {
  const choices = [
    { name: '← Exit', value: EXIT_VALUE },
    ...options.map((opt) => ({
      name: opt.label,
      value: opt.value,
    })),
  ];

  const selection = await select({
    message: 'Select a URL:',
    choices,
    pageSize: 15,
    loop: false,
  });

  if (selection === EXIT_VALUE) {
    return { action: 'exit' };
  }

  return { action: 'selected', value: selection };
}

export async function promptCompanySelection(companies: string[]): Promise<CompanySelectionResult> {
  const choices = [
    { name: '← Back', value: BACK_VALUE },
    ...companies.map((company) => ({
      name: company.charAt(0).toUpperCase() + company.slice(1),
      value: company,
    })),
  ];

  const selection = await select({
    message: 'Select a company:',
    choices,
    loop: false,
  });

  if (selection === BACK_VALUE) {
    return { action: 'back' };
  }

  return { action: 'selected', value: selection as Company };
}

export async function promptEnvironmentSelection(): Promise<EnvironmentSelectionResult> {
  const choices = [
    { name: '← Back', value: BACK_VALUE },
    ...ENVIRONMENTS.map((env) => ({
      name: env.toUpperCase(),
      value: env,
    })),
  ];

  const selection = await select({
    message: 'Select an environment:',
    choices,
    loop: false,
  });

  if (selection === BACK_VALUE) {
    return { action: 'back' };
  }

  return { action: 'selected', value: selection as Environment };
}

export async function promptRetry(errorMessage: string): Promise<RetryResult> {
  console.error(`\nError: ${errorMessage}\n`);

  const retry = await confirm({
    message: 'Would you like to retry?',
    default: true,
  });

  return { retry };
}
