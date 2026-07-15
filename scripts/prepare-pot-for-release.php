<?php
/**
 * Restore the Release Please metadata contract after regenerating the POT.
 *
 * The generic Release Please updater needs a valid PO comment block around the
 * Project-Id-Version field. Keep other generated semver-looking metadata out
 * of that block so a plugin release updates only the project version.
 *
 * @package RAN_Video_Cover
 */

$plugin_root = dirname( __DIR__ );
$plugin_file = file_get_contents( $plugin_root . '/ran-enhanced-cover.php' );
$pot_path    = $plugin_root . '/languages/ran-enhanced-cover.pot';
$pot_file    = file_get_contents( $pot_path );

if ( false === $plugin_file || false === $pot_file || ! preg_match( '/^ \* Version:\s*([^\r\n]+)$/m', $plugin_file, $matches ) ) {
	fwrite( STDERR, "Unable to prepare POT release metadata.\n" );
	exit( 1 );
}

$version  = trim( $matches[1] );
$pot_file = str_replace(
	array(
		"# x-release-please-start-version\n",
		"# x-release-please-end\n",
	),
	'',
	$pot_file
);
$pot_file = preg_replace( '/^"X-Generator:.*\\n"\n/m', '', $pot_file );
$pot_file = preg_replace(
	'/^"Project-Id-Version: RAN Enhanced Cover [^\\n]*\\n"$/m',
	'"Project-Id-Version: RAN Enhanced Cover ' . $version . '\\n"',
	$pot_file,
	1
);

if ( null === $pot_file || ! str_contains( $pot_file, '"Project-Id-Version: RAN Enhanced Cover ' . $version . '\\n"' ) ) {
	fwrite( STDERR, "Unable to update the POT project version.\n" );
	exit( 1 );
}

$header_start = strpos( $pot_file, "msgid \"\"\nmsgstr \"\"\n" );
$header_end   = false === $header_start ? false : strpos( $pot_file, "\n\n", $header_start );

if ( false === $header_end ) {
	fwrite( STDERR, "Unable to locate the POT header.\n" );
	exit( 1 );
}

$pot_file = substr_replace( $pot_file, "# x-release-please-start-version\n", $header_start, 0 );
$header_end += strlen( "# x-release-please-start-version\n" );
$pot_file    = substr_replace( $pot_file, "\n# x-release-please-end", $header_end, 0 );

if ( false === file_put_contents( $pot_path, $pot_file ) ) {
	fwrite( STDERR, "Unable to write the POT file.\n" );
	exit( 1 );
}
