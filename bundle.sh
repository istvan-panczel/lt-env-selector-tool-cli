#!/bin/bash

# LT Environment Selector CLI Bundle Script
# Creates a single JavaScript file that can be run with Bun
#
# Required environment variables:
#   DEFAULT_URL      - The Swagger URL to fetch
#   DEFAULT_PASSWORD - The encryption password
#   COMPANIES        - JSON array of companies, e.g. '["company1","company2"]'
#
# Example:
#   DEFAULT_URL="https://example.com/swagger" \
#   DEFAULT_PASSWORD="secret" \
#   COMPANIES='["acme","globex"]' \
#   ./bundle.sh
#
# Run the output with: bun dist/lt-env-selector.js

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_DIR="$SCRIPT_DIR/dist"

# Validate required environment variables
if [ -z "$DEFAULT_URL" ]; then
  echo "Error: DEFAULT_URL environment variable is required"
  echo ""
  echo "Usage:"
  echo "  DEFAULT_URL=\"https://...\" DEFAULT_PASSWORD=\"...\" COMPANIES='[\"a\",\"b\"]' ./bundle.sh"
  exit 1
fi

if [ -z "$DEFAULT_PASSWORD" ]; then
  echo "Error: DEFAULT_PASSWORD environment variable is required"
  exit 1
fi

if [ -z "$COMPANIES" ]; then
  echo "Error: COMPANIES environment variable is required (JSON array)"
  echo "Example: COMPANIES='[\"company1\",\"company2\"]'"
  exit 1
fi

# Create dist directory
mkdir -p "$DIST_DIR"

echo "Bundling LT Environment Selector CLI..."
echo "URL: $DEFAULT_URL"
echo "Companies: $COMPANIES"
echo ""

OUTPUT_FILE="$DIST_DIR/lt-env-selector.js"

bun build "$SCRIPT_DIR/src/index.ts" \
  --minify \
  --sourcemap=inline \
  --target=bun \
  --define "DEFAULT_URL=\"$DEFAULT_URL\"" \
  --define "DEFAULT_PASSWORD=\"$DEFAULT_PASSWORD\"" \
  --define "COMPANIES=$COMPANIES" \
  --outfile="$OUTPUT_FILE"

# Add shebang for direct execution
TEMP_FILE=$(mktemp)
echo '#!/usr/bin/env bun' > "$TEMP_FILE"
cat "$OUTPUT_FILE" >> "$TEMP_FILE"
mv "$TEMP_FILE" "$OUTPUT_FILE"
chmod +x "$OUTPUT_FILE"

FILE_SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')

echo ""
echo "Bundle complete!"
echo "  -> $OUTPUT_FILE ($FILE_SIZE)"
echo ""
echo "Run with: bun $OUTPUT_FILE"
echo "Or directly: $OUTPUT_FILE (requires Bun in PATH)"
