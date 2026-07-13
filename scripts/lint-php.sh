#!/usr/bin/env bash

set -euo pipefail

while IFS= read -r -d '' file; do
	php -l "$file"
done < <(
	find . \
		-path './build' -prune -o \
		-path './node_modules' -prune -o \
		-path './vendor' -prune -o \
		-path './.git' -prune -o \
		-type f -name '*.php' -print0
)
