#!/bin/bash

# LT Environment Selector CLI Build Script
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
#   ./build.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_DIR="$SCRIPT_DIR/dist"

# Validate required environment variables
if [ -z "$DEFAULT_URL" ]; then
  echo "Error: DEFAULT_URL environment variable is required"
  echo ""
  echo "Usage:"
  echo "  DEFAULT_URL=\"https://...\" DEFAULT_PASSWORD=\"...\" COMPANIES='[\"a\",\"b\"]' ./build.sh"
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

echo "Building LT Environment Selector CLI..."
echo "URL: $DEFAULT_URL"
echo "Companies: $COMPANIES"
echo ""

# Build for different platforms
platforms=(
  "darwin-arm64"
  "darwin-x64"
  "linux-x64"
  "windows-x64"
)

for platform in "${platforms[@]}"; do
  echo "Building for $platform..."

  output_name="lt-env-selector-$platform"
  if [[ "$platform" == windows-* ]]; then
    output_name="$output_name.exe"
  fi

  bun build "$SCRIPT_DIR/src/index.ts" \
    --compile \
    --minify \
    --sourcemap=inline \
    --target="bun-$platform" \
    --define "DEFAULT_URL=\"$DEFAULT_URL\"" \
    --define "DEFAULT_PASSWORD=\"$DEFAULT_PASSWORD\"" \
    --define "COMPANIES=$COMPANIES" \
    --outfile="$DIST_DIR/$output_name"

  echo "  -> $DIST_DIR/$output_name"
done

echo ""
echo "Build complete! Binaries are in the $DIST_DIR directory."
