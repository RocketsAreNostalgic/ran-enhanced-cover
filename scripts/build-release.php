<?php
/**
 * Build the allowlisted WordPress.org upload archive.
 *
 * Usage: php scripts/build-release.php [output-directory]
 *
 * @package RAN_Video_Cover
 */

if ( PHP_SAPI !== 'cli' ) {
	exit( 1 );
}

$plugin_root = dirname( __DIR__ );
$allowlist   = file( $plugin_root . '/release-include.txt', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES );

if ( false === $allowlist ) {
	fwrite( STDERR, "Missing release-include.txt.\n" );
	exit( 1 );
}

$allowlist = array_values(
	array_filter(
		array_map( 'trim', $allowlist ),
		static function ( $entry ) {
			return '' !== $entry && '#' !== substr( $entry, 0, 1 );
		}
	)
);

$plugin_file = file_get_contents( $plugin_root . '/ran-enhanced-cover.php' );

if ( false === $plugin_file || ! preg_match( '/^ \* Version:\s*([^\r\n]+)$/m', $plugin_file, $matches ) ) {
	fwrite( STDERR, "Unable to determine the plugin version.\n" );
	exit( 1 );
}

$version     = trim( $matches[1] );
$output_dir  = isset( $argv[1] ) ? rtrim( $argv[1], DIRECTORY_SEPARATOR ) : $plugin_root . '/dist';
$output_file = $output_dir . '/ran-enhanced-cover-' . $version . '.zip';

if ( ! class_exists( 'ZipArchive' ) ) {
	fwrite( STDERR, "The PHP ZipArchive extension is required to build a release.\n" );
	exit( 1 );
}

if ( ! is_dir( $output_dir ) && ! mkdir( $output_dir, 0755, true ) && ! is_dir( $output_dir ) ) {
	fwrite( STDERR, "Unable to create the release directory.\n" );
	exit( 1 );
}

if ( file_exists( $output_file ) && ! unlink( $output_file ) ) {
	fwrite( STDERR, "Unable to replace the existing release archive.\n" );
	exit( 1 );
}

$is_allowlisted = static function ( $relative_path ) use ( $allowlist ) {
	foreach ( $allowlist as $entry ) {
		if ( $relative_path === $entry || 0 === strpos( $relative_path, $entry . '/' ) ) {
			return true;
		}
	}

	return false;
};

$archive = new ZipArchive();

if ( true !== $archive->open( $output_file, ZipArchive::CREATE | ZipArchive::OVERWRITE ) ) {
	fwrite( STDERR, "Unable to open the release archive.\n" );
	exit( 1 );
}

$iterator = new RecursiveIteratorIterator(
	new RecursiveDirectoryIterator( $plugin_root, FilesystemIterator::SKIP_DOTS ),
	RecursiveIteratorIterator::LEAVES_ONLY
);

foreach ( $iterator as $file ) {
	if ( ! $file->isFile() ) {
		continue;
	}

	$relative_path = str_replace( DIRECTORY_SEPARATOR, '/', $iterator->getSubPathName() );

	if ( ! $is_allowlisted( $relative_path ) ) {
		continue;
	}

	if ( ! $archive->addFile( $file->getPathname(), 'ran-enhanced-cover/' . $relative_path ) ) {
		$archive->close();
		fwrite( STDERR, "Unable to add {$relative_path} to the release archive.\n" );
		exit( 1 );
	}
}

$archive->close();

fwrite( STDOUT, "Built {$output_file}.\n" );
