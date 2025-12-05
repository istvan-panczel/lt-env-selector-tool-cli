export const HELP_MESSAGE = `
LT Environment Selector CLI

Usage:
  lt-env-selector [options]

Options:
  --url <url>         Override the default Swagger URL
  --password <pass>   Override the default encryption password
  --help, -h          Show this help message

Build-time Configuration:
  The following are configured at build time and cannot be changed at runtime:
  - DEFAULT_URL       Default Swagger URL to fetch servers from
  - DEFAULT_PASSWORD  Default encryption password for QR code generation
  - COMPANIES         List of available companies to select from
`;
