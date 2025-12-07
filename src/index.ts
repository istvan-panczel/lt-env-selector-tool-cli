import ora from 'ora';
import { getConfig } from './config';
import { type FetchResult, fetchSwaggerUrls } from './fetcher';
import { promptCompanySelection, promptEnvironmentSelection, promptRetry, promptUrlSelection } from './prompts';
import { encryptData } from './encryption';
import { displayQRCode, waitForKeyPress } from './qr';
import { stripMajorVersion } from './url';
import type { Company, Environment, UrlOption } from './types';

async function fetchUrlsWithRetry(url: string): Promise<UrlOption[] | null> {
  while (true) {
    const spinner = ora('Fetching URL options...').start();

    const result: FetchResult = await fetchSwaggerUrls(url);

    if (result.success && result.data) {
      spinner.succeed('URLs loaded successfully');
      return result.data;
    }

    spinner.fail('Failed to fetch URLs');

    const { retry } = await promptRetry(result.error || 'Unknown error');
    if (!retry) {
      return null;
    }
  }
}

async function main(): Promise<void> {
  const config = getConfig();

  console.log('\n🔧 LT Environment Selector\n');

  // Fetch URLs
  const urlOptions = await fetchUrlsWithRetry(config.url);
  if (!urlOptions) {
    console.log('Goodbye!');
    process.exit(0);
  }

  // Main selection loop
  while (true) {
    // Step 1: URL Selection
    const urlResult = await promptUrlSelection(urlOptions);
    if (urlResult.action === 'exit') {
      console.log('Goodbye!');
      process.exit(0);
    }

    const selectedUrl = urlResult.value!;

    // Step 2: Company Selection
    let selectedCompany: Company | null = null;
    while (selectedCompany === null) {
      const companyResult = await promptCompanySelection(config.companies);
      if (companyResult.action === 'back') {
        break; // Go back to URL selection
      }
      selectedCompany = companyResult.value!;
    }

    if (selectedCompany === null) {
      continue; // User went back, restart URL selection
    }

    // Step 3: Environment Selection
    let selectedEnv: Environment | null = null;
    while (selectedEnv === null) {
      const envResult = await promptEnvironmentSelection();
      if (envResult.action === 'back') {
        // Go back to company selection
        const companyResult = await promptCompanySelection(config.companies);
        if (companyResult.action === 'back') {
          break; // Go back to URL selection
        }
        selectedCompany = companyResult.value!;
        continue;
      }
      selectedEnv = envResult.value!;
    }

    if (selectedEnv === null) {
      continue; // User went back to URL selection
    }

    // Strip major version from URL (e.g., /v5 -> '')
    const selectedUrlWithoutMajorVersion = stripMajorVersion(selectedUrl);

    // Generate encrypted data
    const encrypted = encryptData(
      {
        company: selectedCompany,
        env: selectedEnv,
        url: selectedUrlWithoutMajorVersion,
      },
      config.password
    );

    // Display QR code
    console.clear();
    console.log('\n✅ Configuration Generated\n');
    console.log(`URL: ${selectedUrl}`);
    console.log(`Company: ${selectedCompany}`);
    console.log(`Environment: ${selectedEnv}`);

    await displayQRCode(encrypted);

    // Wait for key press to continue
    await waitForKeyPress();
    console.clear();
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
