<?php
/**
 * Verify the shape of the generated WordPress.org upload archive.
 *
 * Usage: php scripts/verify-release.php [archive-path]
 *
 * @package RAN_Video_Cover
 */

if ( PHP_SAPI !== 'cli' ) {
	exit( 1 );
}

$plugin_root = dirname( __DIR__ );
$plugin_file = file_get_contents( $plugin_root . '/ran-video-cover.php' );

if ( false === $plugin_file || ! preg_match( '/^ \* Version:\s*([^\r\n]+)$/m', $plugin_file, $matches ) ) {
	fwrite( STDERR, "Unable to determine the plugin version.\n" );
	exit( 1 );
}

$version      = trim( $matches[1] );
$archive_path = $argv[1] ?? $plugin_root . '/dist/ran-video-cover-' . $version . '.zip';

if ( ! class_exists( 'ZipArchive' ) || ! is_readable( $archive_path ) ) {
	fwrite( STDERR, "A readable release ZIP and the PHP ZipArchive extension are required.\n" );
	exit( 1 );
}

$archive = new ZipArchive();

if ( true !== $archive->open( $archive_path ) ) {
	fwrite( STDERR, "Unable to open the release archive.\n" );
	exit( 1 );
}

$entries = array();

for ( $index = 0; $index < $archive->numFiles; $index++ ) {
	$entries[] = $archive->getNameIndex( $index );
}

$archive->close();

$required_entries = array(
	'ran-video-cover/ran-video-cover.php',
	'ran-video-cover/readme.txt',
	'ran-video-cover/LICENSE',
	'ran-video-cover/blocks/media/video-cover/block.json',
	'ran-video-cover/build/blocks/media/video-cover/block.json',
	'ran-video-cover/build/blocks/media/video-cover/index.js',
	'ran-video-cover/build/blocks/media/video-cover/style-index.css',
	'ran-video-cover/build/blocks/media/video-cover/view.js',
);

$forbidden_prefixes = array(
	'ran-video-cover/.git/',
	'ran-video-cover/.github/',
	'ran-video-cover/node_modules/',
	'ran-video-cover/vendor/',
	'ran-video-cover/tests/',
	'ran-video-cover/scripts/',
	'ran-video-cover/wordpress-org/',
);

foreach ( $required_entries as $entry ) {
	if ( ! in_array( $entry, $entries, true ) ) {
		fwrite( STDERR, "Release archive is missing {$entry}.\n" );
		exit( 1 );
	}
}

foreach ( $entries as $entry ) {
	foreach ( $forbidden_prefixes as $prefix ) {
		if ( 0 === strpos( $entry, $prefix ) ) {
			fwrite( STDERR, "Release archive includes development-only path {$entry}.\n" );
			exit( 1 );
		}
	}
}

fwrite( STDOUT, "Release archive structure is valid.\n" );
