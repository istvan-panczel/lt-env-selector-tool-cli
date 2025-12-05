# LT Environment Selector CLI

> [!WARNING]
> This is an internal helper tool for configuring a separate mobile application. It is not intended for standalone use.

A command-line tool for selecting and configuring environment settings from Swagger API endpoints. The tool fetches available servers from an OpenAPI specification, allows interactive selection of URL, company, and environment, then generates an encrypted QR code for mobile app configuration.

## Features

- Fetches server URLs from Swagger/OpenAPI specifications
- Interactive terminal UI with keyboard navigation
- Multi-step selection: URL → Company → Environment
- AES encryption of configuration data
- QR code generation in terminal
- Cross-platform builds (macOS, Linux, Windows)

## Prerequisites

- [Bun](https://bun.sh) runtime (v1.0+)

## Installation

```bash
bun install
```

## npm Scripts

| Script | Description |
|--------|-------------|
| `bun run start` | Run in development mode |
| `bun run build` | Build standalone executables (all platforms) |
| `bun run bundle` | Build single JS bundle (requires Bun to run) |
| `bun run test` | Run unit tests |
| `bun run test:coverage` | Run unit tests with coverage report |
| `bun run format-check` | Check code formatting with Prettier |
| `bun run format-fix` | Fix code formatting with Prettier |

## Building

Both build options require three environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DEFAULT_URL` | Swagger page URL | `https://example.com/swagger/index.html` |
| `DEFAULT_PASSWORD` | Encryption password | `your-secret-password` |
| `COMPANIES` | JSON array of company names | `'["acme","globex","initech"]'` |

### Option 1: Bundle Script (Recommended for Bun users)

Creates a single JavaScript file (~4 MB) that runs with Bun installed:

```bash
DEFAULT_URL="https://your-swagger-url.com/swagger/index.html" \
DEFAULT_PASSWORD="your-encryption-password" \
COMPANIES='["company1","company2","company3"]' \
./bundle.sh
```

> **Note:** If your password contains special characters (like backticks `` ` ``), use double quotes and escape them with `\`. For example: `DEFAULT_PASSWORD="pass\`word"`

**Output:** `dist/lt-env-selector.js`

**Run with:**
```bash
bun dist/lt-env-selector.js
# or directly (if Bun is in PATH):
./dist/lt-env-selector.js
```

### Option 2: Standalone Executables

Creates self-contained binaries (60-113 MB) that don't require Bun:

```bash
DEFAULT_URL="https://your-swagger-url.com/swagger/index.html" \
DEFAULT_PASSWORD="your-encryption-password" \
COMPANIES='["company1","company2","company3"]' \
./build.sh
```

> **Note:** If your password contains special characters (like backticks `` ` ``), use double quotes and escape them with `\`. For example: `DEFAULT_PASSWORD="pass\`word"`

**Output:**
| File | Platform | Size |
|------|----------|------|
| `lt-env-selector-darwin-arm64` | macOS (Apple Silicon) | ~60 MB |
| `lt-env-selector-darwin-x64` | macOS (Intel) | ~66 MB |
| `lt-env-selector-linux-x64` | Linux (x64) | ~102 MB |
| `lt-env-selector-windows-x64.exe` | Windows (x64) | ~113 MB |

**Run with:**
```bash
./dist/lt-env-selector-darwin-arm64
```

## Usage

### Command Line Options

```
Options:
  --url <url>         Override the default Swagger URL
  --password <pass>   Override the default encryption password
  --help, -h          Show help message
```

### Navigation

- Use **↑/↓** arrow keys to navigate options
- Press **Enter** or **Space** to select
- Select **← Back** to return to previous screen
- Select **← Exit** to quit the application

## Development

Run in development mode (requires build-time constants to be defined):

```bash
bun run start
```

## Testing

This project uses [Bun's built-in test runner](https://bun.sh/docs/cli/test).

```bash
# Run tests
bun test

# Run tests with coverage report
bun test --coverage
```

### Coverage Goals

The test suite focuses on **core functionality** rather than aiming for 100% coverage:

Interactive prompts, QR code display, and main orchestration logic are not unit tested as they are UI-dependent or better suited for integration testing.
