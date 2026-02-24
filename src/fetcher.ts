import * as cheerio from 'cheerio';
import { parse as parseYaml } from 'yaml';
import type { BuildVersionInfo, UrlOption } from './types';

export interface FetchResult {
  success: boolean;
  data?: UrlOption[];
  error?: string;
}

interface OpenAPIServer {
  url: string;
  description?: string;
}

interface OpenAPISpec {
  servers?: OpenAPIServer[];
}

export function resolveUrl(baseUrl: string, relativeUrl: string): string {
  if (relativeUrl.startsWith('http')) {
    return relativeUrl;
  } else if (relativeUrl.startsWith('./')) {
    const base = baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1);
    return base + relativeUrl.substring(2);
  } else if (relativeUrl.startsWith('/')) {
    const urlObj = new URL(baseUrl);
    return urlObj.origin + relativeUrl;
  } else {
    const base = baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1);
    return base + relativeUrl;
  }
}

async function extractSwaggerSpecUrl(htmlUrl: string): Promise<string | null> {
  try {
    const response = await fetch(htmlUrl);
    if (!response.ok) return null;

    const html = await response.text();
    const $ = cheerio.load(html);

    // Find swagger-initializer script
    let initializerSrc: string | null = null;
    $('script[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (src && src.includes('swagger-initializer')) {
        initializerSrc = src;
      }
    });

    if (!initializerSrc) return null;

    const initializerUrl = resolveUrl(htmlUrl, initializerSrc);

    // Fetch initializer script
    const initResponse = await fetch(initializerUrl);
    if (!initResponse.ok) return null;

    const initScript = await initResponse.text();

    // Extract url from script (looking for url: "..." or url: '...')
    const urlMatch = initScript.match(/url:\s*["']([^"']+)["']/);
    if (urlMatch && urlMatch[1]) {
      return resolveUrl(initializerUrl, urlMatch[1]);
    }

    return null;
  } catch {
    return null;
  }
}

async function fetchOpenAPISpec(specUrl: string): Promise<OpenAPISpec | null> {
  try {
    const response = await fetch(specUrl);
    if (!response.ok) return null;

    const content = await response.text();

    // Try to parse as YAML (also works for JSON)
    return parseYaml(content) as OpenAPISpec;
  } catch {
    return null;
  }
}

export async function fetchSwaggerUrls(url: string): Promise<FetchResult> {
  try {
    // First, try to find the OpenAPI spec URL from the Swagger HTML page
    const specUrl = await extractSwaggerSpecUrl(url);

    if (!specUrl) {
      return {
        success: false,
        error: 'Could not find OpenAPI specification URL in the Swagger page',
      };
    }

    // Fetch the OpenAPI spec
    const spec = await fetchOpenAPISpec(specUrl);

    if (!spec) {
      return {
        success: false,
        error: 'Could not fetch or parse the OpenAPI specification',
      };
    }

    if (!spec.servers || spec.servers.length === 0) {
      return {
        success: false,
        error: 'No servers found in the OpenAPI specification',
      };
    }

    // Extract servers as URL options
    const options: UrlOption[] = spec.servers.map((server) => ({
      value: server.url,
      label: server.description ? `${server.url} - ${server.description}` : server.url,
    }));

    return {
      success: true,
      data: options,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export interface BuildVersionResult {
  success: boolean;
  data?: BuildVersionInfo;
  error?: string;
}

export async function fetchBuildVersion(selectedUrl: string): Promise<BuildVersionResult> {
  try {
    const url = `${selectedUrl}/mobile/system/buildVersion`;
    const response = await fetch(url);

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = (await response.json()) as BuildVersionInfo;

    if (!data || typeof data.version !== 'string') {
      return {
        success: false,
        error: 'Invalid response format from buildVersion endpoint',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    return {
      success: false,
      error: errorMessage,
    };
  }
}
