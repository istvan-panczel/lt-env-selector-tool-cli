import type { Config } from './types';
import { HELP_MESSAGE } from './constants/help';

declare const DEFAULT_URL: string;
declare const DEFAULT_PASSWORD: string;
declare const COMPANIES: string[];

function getBuildTimeConfig(): { url: string; password: string; companies: string[] } {
  const hasUrl = typeof DEFAULT_URL !== 'undefined';
  const hasPassword = typeof DEFAULT_PASSWORD !== 'undefined';
  const hasCompanies = typeof COMPANIES !== 'undefined';

  if (!hasUrl || !hasPassword || !hasCompanies) {
    console.error('Error: Build-time configuration is missing.');
    process.exit(1);
  }

  return {
    url: DEFAULT_URL,
    password: DEFAULT_PASSWORD,
    companies: COMPANIES,
  };
}

export function parseArgs(args: string[]): { url?: string; password?: string; help?: boolean } {
  const result: { url?: string; password?: string; help?: boolean } = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;

    if (arg === '--url' && args[i + 1]) {
      result.url = args[++i]!;
    } else if (arg.startsWith('--url=')) {
      result.url = arg.substring('--url='.length);
    } else if (arg === '--password' && args[i + 1]) {
      result.password = args[++i]!;
    } else if (arg.startsWith('--password=')) {
      result.password = arg.substring('--password='.length);
    } else if (arg === '--help' || arg === '-h') {
      result.help = true;
    }
  }

  return result;
}

export function getConfig(): Config {
  const buildConfig = getBuildTimeConfig();
  const cliArgs = parseArgs(process.argv.slice(2));

  if (cliArgs.help) {
    console.log(HELP_MESSAGE);
    process.exit(0);
  }

  return {
    url: cliArgs.url || buildConfig.url,
    password: cliArgs.password || buildConfig.password,
    companies: buildConfig.companies,
  };
}
