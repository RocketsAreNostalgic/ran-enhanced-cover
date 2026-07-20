<?php
/**
 * Verify the exact runtime contents and metadata of a RAN Enhanced Cover archive.
 *
 * Usage: php scripts/verify-release.php [archive-path]
 *
 * @package RAN_Video_Cover
 */

declare(strict_types = 1);

if ( PHP_SAPI !== 'cli' ) {
	exit( 1 );
}

require_once __DIR__ . '/build-release.php';

$plugin_root = dirname( __DIR__ );

try {
	if ( ! class_exists( 'ZipArchive' ) ) {
		throw new RuntimeException( 'The PHP ZipArchive extension is required to verify release archives.' );
	}

	$version   = ran_enhanced_cover_release_plugin_version( $plugin_root );
	$allowlist = ran_enhanced_cover_release_allowlist( $plugin_root );
	$files     = ran_enhanced_cover_release_files( $plugin_root, $allowlist );
	ran_enhanced_cover_release_validate_versions( $plugin_root, $version );

	$archive_path = $argv[1] ?? $plugin_root . '/dist/' . RAN_ENHANCED_COVER_RELEASE_SLUG . '-' . $version . '.zip';

	if ( ! is_readable( $archive_path ) ) {
		throw new RuntimeException( 'A readable release ZIP is required.' );
	}

	ran_enhanced_cover_release_validate_archive( $archive_path, $files, $version );
	fwrite( STDOUT, "Release archive structure and metadata are valid.\n" );
} catch ( Throwable $exception ) {
	fwrite( STDERR, $exception->getMessage() . PHP_EOL );
	exit( 1 );
}
