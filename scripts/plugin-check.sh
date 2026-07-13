#!/usr/bin/env bash

set -euo pipefail

PLUGIN_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARCHIVE_PATH="${1:-${PLUGIN_ROOT}/dist/ran-video-cover-1.0.0.zip}"

if ! wp cli has-command 'plugin check' >/dev/null 2>&1; then
	echo 'Plugin Check is not installed. Install and activate the official plugin-check plugin first.' >&2
	exit 1
fi

wp plugin check "${ARCHIVE_PATH}"
