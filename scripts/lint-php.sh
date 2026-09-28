#!/usr/bin/env bash

set -euo pipefail

FILE_LIST="$(mktemp)"
cleanup() {
	rm -f "${FILE_LIST}"
}
trap cleanup EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM

if ! find . \
	-path './node_modules' -prune -o \
	-path './vendor' -prune -o \
	-path './.git' -prune -o \
	-type f \( -name '*.php' -o -name '*.php.template' \) -print0 > "${FILE_LIST}"; then
	echo "Unable to discover PHP files for syntax linting." >&2
	exit 1
fi

if [[ ! -s "${FILE_LIST}" ]]; then
	echo "No PHP source files found." >&2
	exit 1
fi

while IFS= read -r -d '' file; do
	php -l "$file"
done < "${FILE_LIST}"
