#!/usr/bin/env bash

set -euo pipefail

PLUGIN_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLUGIN_VERSION="$(php -r '$plugin_file = file_get_contents($argv[1]); if (false === $plugin_file || ! preg_match("/^ \\* Version:\\s*([^\\r\\n]+)$/m", $plugin_file, $matches)) { fwrite(STDERR, "Unable to determine the plugin version.\\n"); exit(1); } echo trim($matches[1]);' "${PLUGIN_ROOT}/ran-enhanced-cover.php")"
ARCHIVE_PATH="${1:-${PLUGIN_ROOT}/dist/ran-enhanced-cover-${PLUGIN_VERSION}.zip}"

if ! wp cli has-command 'plugin check' >/dev/null 2>&1; then
	echo 'Plugin Check is not installed. Install and activate the official plugin-check plugin first.' >&2
	exit 1
fi

wp plugin check "${ARCHIVE_PATH}"
