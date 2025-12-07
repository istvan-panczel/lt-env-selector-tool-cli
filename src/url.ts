/**
 * Removes the major API version suffix from a URL.
 * E.g., "https://foo.bar.com/api/v5" -> "https://foo.bar.com/api"
 */
export function stripMajorVersion(url: string): string {
  return url.replace(/\/v\d+$/, '');
}
