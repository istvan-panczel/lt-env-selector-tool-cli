import { afterEach, describe, expect, mock, test } from 'bun:test';
import { fetchSwaggerUrls, resolveUrl } from './fetcher';

describe('resolveUrl', () => {
  test('returns absolute HTTP URL unchanged', () => {
    const result = resolveUrl('https://example.com/swagger/', 'http://api.example.com/spec.yaml');
    expect(result).toBe('http://api.example.com/spec.yaml');
  });

  test('returns absolute HTTPS URL unchanged', () => {
    const result = resolveUrl('https://example.com/swagger/', 'https://api.example.com/spec.yaml');
    expect(result).toBe('https://api.example.com/spec.yaml');
  });

  test('resolves relative ./path against base URL', () => {
    const result = resolveUrl('https://example.com/swagger/index.html', './openapi.yaml');
    expect(result).toBe('https://example.com/swagger/openapi.yaml');
  });

  test('resolves relative /path against origin', () => {
    const result = resolveUrl('https://example.com/swagger/index.html', '/api/openapi.yaml');
    expect(result).toBe('https://example.com/api/openapi.yaml');
  });

  test('resolves relative path (no prefix) against base directory', () => {
    const result = resolveUrl('https://example.com/swagger/index.html', 'openapi.yaml');
    expect(result).toBe('https://example.com/swagger/openapi.yaml');
  });

  test('handles base URL with trailing slash', () => {
    const result = resolveUrl('https://example.com/swagger/', './openapi.yaml');
    expect(result).toBe('https://example.com/swagger/openapi.yaml');
  });

  test('handles base URL with query string', () => {
    const result = resolveUrl('https://example.com/swagger/index.html?version=1', './openapi.yaml');
    expect(result).toBe('https://example.com/swagger/openapi.yaml');
  });
});

describe('fetchSwaggerUrls', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test('returns error when swagger page fetch fails', async () => {
    globalThis.fetch = mock(() => Promise.resolve(new Response('', { status: 404 })));

    const result = await fetchSwaggerUrls('https://example.com/swagger/');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Could not find OpenAPI specification URL');
  });

  test('returns error when no swagger-initializer script found', async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response('<html><body>No swagger here</body></html>', {
          status: 200,
        })
      )
    );

    const result = await fetchSwaggerUrls('https://example.com/swagger/');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Could not find OpenAPI specification URL');
  });

  test('returns error when spec URL extraction fails', async () => {
    const swaggerHtml = `
      <html>
        <script src="./swagger-initializer.js"></script>
      </html>
    `;
    const initializerScript = 'window.ui = SwaggerUIBundle({});'; // No url property

    let callCount = 0;
    globalThis.fetch = mock(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve(new Response(swaggerHtml, { status: 200 }));
      }
      return Promise.resolve(new Response(initializerScript, { status: 200 }));
    });

    const result = await fetchSwaggerUrls('https://example.com/swagger/');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Could not find OpenAPI specification URL');
  });

  test('returns error when OpenAPI spec fetch fails', async () => {
    const swaggerHtml = `
      <html>
        <script src="./swagger-initializer.js"></script>
      </html>
    `;
    const initializerScript = `
      window.ui = SwaggerUIBundle({
        url: "./openapi.yaml"
      });
    `;

    let callCount = 0;
    globalThis.fetch = mock(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve(new Response(swaggerHtml, { status: 200 }));
      }
      if (callCount === 2) {
        return Promise.resolve(new Response(initializerScript, { status: 200 }));
      }
      // Spec fetch fails with 404
      return Promise.resolve(new Response('Not Found', { status: 404 }));
    });

    const result = await fetchSwaggerUrls('https://example.com/swagger/');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Could not fetch or parse the OpenAPI specification');
  });

  test('returns error when no servers in spec', async () => {
    const swaggerHtml = `
      <html>
        <script src="./swagger-initializer.js"></script>
      </html>
    `;
    const initializerScript = `
      window.ui = SwaggerUIBundle({
        url: "./openapi.yaml"
      });
    `;
    const openApiSpec = `
openapi: "3.0.0"
info:
  title: Test API
  version: "1.0"
paths: {}
    `;

    let callCount = 0;
    globalThis.fetch = mock(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve(new Response(swaggerHtml, { status: 200 }));
      }
      if (callCount === 2) {
        return Promise.resolve(new Response(initializerScript, { status: 200 }));
      }
      return Promise.resolve(new Response(openApiSpec, { status: 200 }));
    });

    const result = await fetchSwaggerUrls('https://example.com/swagger/');

    expect(result.success).toBe(false);
    expect(result.error).toContain('No servers found');
  });

  test('successfully parses OpenAPI spec with servers', async () => {
    const swaggerHtml = `
      <html>
        <script src="./swagger-initializer.js"></script>
      </html>
    `;
    const initializerScript = `
      window.ui = SwaggerUIBundle({
        url: "./openapi.yaml"
      });
    `;
    const openApiSpec = `
openapi: "3.0.0"
info:
  title: Test API
  version: "1.0"
servers:
  - url: https://api.example.com
    description: Production server
  - url: https://staging.example.com
paths: {}
    `;

    let callCount = 0;
    globalThis.fetch = mock(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve(new Response(swaggerHtml, { status: 200 }));
      }
      if (callCount === 2) {
        return Promise.resolve(new Response(initializerScript, { status: 200 }));
      }
      return Promise.resolve(new Response(openApiSpec, { status: 200 }));
    });

    const result = await fetchSwaggerUrls('https://example.com/swagger/');

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(result.data![0]).toEqual({
      value: 'https://api.example.com',
      label: 'https://api.example.com - Production server',
    });
    expect(result.data![1]).toEqual({
      value: 'https://staging.example.com',
      label: 'https://staging.example.com',
    });
  });

  test('handles network error gracefully', async () => {
    globalThis.fetch = mock(() => Promise.reject(new Error('Network error')));

    const result = await fetchSwaggerUrls('https://example.com/swagger/');

    expect(result.success).toBe(false);
    // Network errors in extractSwaggerSpecUrl are caught and return null,
    // resulting in the generic "Could not find" error message
    expect(result.error).toContain('Could not find OpenAPI specification URL');
  });
});
