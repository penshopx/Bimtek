#!/bin/bash
set -e

echo "→ Installing dependencies..."
bun install

echo "→ Running database migrations..."
bun run db:migrate

echo "✓ Post-merge setup complete."
