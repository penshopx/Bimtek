#!/usr/bin/env bash
set -euo pipefail

mapfile -t test_files < <(
  find src -type f \( -name '*.test.ts' -o -name '*.test.tsx' \) | sort
)

if ((${#test_files[@]} == 0)); then
  echo "No Bun unit tests found under src/." >&2
  exit 1
fi

echo "Running ${#test_files[@]} Bun test files in isolated processes."
for test_file in "${test_files[@]}"; do
  echo
  echo "=== ${test_file} ==="
  bun test "$test_file"
done
