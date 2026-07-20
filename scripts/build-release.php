<?php
/**
 * Build and validate the RAN Enhanced Cover runtime archive.
 *
 * Usage: php scripts/build-release.php [output-directory] [--check] [--output=/absolute/archive.zip]
 *
 * @package RAN_Video_Cover
 */

declare(strict_types = 1);

// phpcs:disable WordPress.WP.AlternativeFunctions -- This standalone CLI tool runs without WordPress or WP_Filesystem.

const RAN_ENHANCED_COVER_RELEASE_SLUG  = 'ran-enhanced-cover';
const RAN_ENHANCED_COVER_RELEASE_MTIME = 315532800;

/**
 * Read the version from the WordPress plugin header.
 *
 * @param string $root Plugin root.
 * @return string
 * @throws RuntimeException When the header is missing or unsafe.
 */
function ran_enhanced_cover_release_plugin_version( string $root ): string {
	$plugin_file = file_get_contents( $root . '/' . RAN_ENHANCED_COVER_RELEASE_SLUG . '.php' );

	if ( false === $plugin_file || ! preg_match( '/^ \* Version:\s*([^\r\n]+)$/m', $plugin_file, $matches ) ) {
		throw new RuntimeException( 'Unable to read the plugin header version.' );
	}

	$version = trim( $matches[1] );

	if ( '' === $version || ! preg_match( '/^[0-9A-Za-z.+-]+$/', $version ) ) {
		throw new RuntimeException( 'The plugin header version is unsafe for a release archive.' );
	}

	return $version;
}

/**
 * Read the explicit runtime allowlist.
 *
 * @param string $root Plugin root.
 * @return array<int,string>
 * @throws RuntimeException When the allowlist is unsafe.
 */
function ran_enhanced_cover_release_allowlist( string $root ): array {
	$contents = file( $root . '/release-include.txt', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES );

	if ( false === $contents ) {
		throw new RuntimeException( 'Missing release-include.txt.' );
	}

	$allowlist = array();

	foreach ( $contents as $entry ) {
		$entry = trim( $entry );

		if ( '' === $entry || '#' === substr( $entry, 0, 1 ) ) {
			continue;
		}

		$entry = rtrim( str_replace( '\\', '/', $entry ), '/' );

		if ( '' === $entry || '/' === $entry[0] || preg_match( '#(^|/)\.\.?($|/)#', $entry ) ) {
			throw new RuntimeException( 'Unsafe release allowlist path: ' . $entry );
		}

		$allowlist[] = $entry;
	}

	if ( empty( $allowlist ) || count( $allowlist ) !== count( array_unique( $allowlist ) ) ) {
		throw new RuntimeException( 'The release allowlist must contain unique runtime paths.' );
	}

	return $allowlist;
}

/**
 * Return every explicitly shippable runtime file in deterministic order.
 *
 * @param string            $root Plugin root.
 * @param array<int,string> $allowlist Release paths.
 * @return array<int,string>
 * @throws RuntimeException When an allowlisted path is missing or unsafe.
 */
function ran_enhanced_cover_release_files( string $root, array $allowlist ): array {
	$files = array();

	foreach ( $allowlist as $entry ) {
		$source = $root . '/' . $entry;

		if ( is_link( $source ) || ! file_exists( $source ) ) {
			throw new RuntimeException( 'Release allowlist path does not exist or is a symbolic link: ' . $entry );
		}

		if ( is_file( $source ) ) {
			$files[] = $entry;
			continue;
		}

		if ( ! is_dir( $source ) ) {
			throw new RuntimeException( 'Release allowlist path is not a file or directory: ' . $entry );
		}

		$iterator = new RecursiveIteratorIterator(
			new RecursiveDirectoryIterator( $source, FilesystemIterator::SKIP_DOTS ),
			RecursiveIteratorIterator::LEAVES_ONLY
		);

		foreach ( $iterator as $file ) {
			$relative_path = str_replace( DIRECTORY_SEPARATOR, '/', ltrim( str_replace( $root, '', $file->getPathname() ), DIRECTORY_SEPARATOR ) );

			if ( $file->isLink() || ! $file->isFile() || preg_match( '#(^|/)\.#', $relative_path ) ) {
				throw new RuntimeException( 'Release runtime directories must contain regular, non-hidden files only: ' . $relative_path );
			}

			$files[] = $relative_path;
		}
	}

	$files = array_values( array_unique( $files ) );
	sort( $files, SORT_STRING );

	return $files;
}

/**
 * Validate every Release Please-managed version source.
 *
 * @param string $root Plugin root.
 * @param string $version Expected version.
 * @return void
 * @throws RuntimeException When version sources differ.
 */
function ran_enhanced_cover_release_validate_versions( string $root, string $version ): void {
	$plugin_file = file_get_contents( $root . '/ran-enhanced-cover.php' );
	$package     = file_get_contents( $root . '/package.json' );
	$pot         = file_get_contents( $root . '/languages/ran-enhanced-cover.pot' );
	$readme      = file_get_contents( $root . '/readme.txt' );
	$source_block = file_get_contents( $root . '/blocks/media/video-cover/block.json' );
	$build_block  = file_get_contents( $root . '/build/blocks/media/video-cover/block.json' );

	if (
		false === $plugin_file ||
		false === $package ||
		false === $pot ||
		false === $readme ||
		false === $source_block ||
		false === $build_block ||
		! str_contains( $plugin_file, "RAN_VIDEO_COVER_VERSION', '" . $version . "'" ) ||
		! preg_match( '/"version"\s*:\s*"' . preg_quote( $version, '/' ) . '"/', $package ) ||
		! preg_match( '/"version"\s*:\s*"' . preg_quote( $version, '/' ) . '"/', $source_block ) ||
		! preg_match( '/"version"\s*:\s*"' . preg_quote( $version, '/' ) . '"/', $build_block ) ||
		! str_contains( $pot, 'Project-Id-Version: RAN Enhanced Cover ' . $version ) ||
		! preg_match( '/^Stable tag:\s*' . preg_quote( $version, '/' ) . '\s*$/mi', $readme )
	) {
		throw new RuntimeException( 'Plugin header, runtime constant, package metadata, block metadata, readme.txt, and POT project version must agree.' );
	}
}

/**
 * Resolve the requested output file while preserving the legacy directory argument.
 *
 * @param array<int,string> $arguments Command arguments without the script path.
 * @param string            $root Plugin root.
 * @param string            $version Expected version.
 * @return string
 * @throws RuntimeException When the requested arguments are invalid.
 */
function ran_enhanced_cover_release_output_path( array $arguments, string $root, string $version ): string {
	$output_file      = null;
	$output_directory = null;

	for ( $index = 0, $argument_count = count( $arguments ); $index < $argument_count; $index++ ) {
		$argument = $arguments[ $index ];

		if ( '--check' === $argument ) {
			continue;
		}

		if ( 0 === strpos( $argument, '--output=' ) ) {
			$output_file = substr( $argument, strlen( '--output=' ) );
			continue;
		}

		if ( '--output' === $argument ) {
			if ( ! isset( $arguments[ $index + 1 ] ) || '' === $arguments[ $index + 1 ] || 0 === strpos( $arguments[ $index + 1 ], '--' ) ) {
				throw new RuntimeException( 'The --output option requires an archive path.' );
			}

			$output_file = $arguments[ ++$index ];
			continue;
		}

		if ( 0 === strpos( $argument, '--' ) ) {
			throw new RuntimeException( 'Unknown release archive option: ' . $argument );
		}

		if ( null !== $output_directory ) {
			throw new RuntimeException( 'Only one legacy release output directory may be provided.' );
		}

		$output_directory = $argument;
	}

	if ( null !== $output_file && null !== $output_directory ) {
		throw new RuntimeException( 'Use either an output directory or --output, not both.' );
	}

	if ( null !== $output_file ) {
		return $output_file;
	}

	if ( null === $output_directory ) {
		$output_directory = $root . '/dist';
	}

	return rtrim( $output_directory, DIRECTORY_SEPARATOR ) . '/' . RAN_ENHANCED_COVER_RELEASE_SLUG . '-' . $version . '.zip';
}

/**
 * Validate the generated archive's exact runtime file list and embedded metadata.
 *
 * @param string            $archive_path Archive path.
 * @param array<int,string> $files Runtime relative paths.
 * @param string            $version Expected version.
 * @return void
 * @throws RuntimeException When the archive cannot be read or is invalid.
 */
function ran_enhanced_cover_release_validate_archive( string $archive_path, array $files, string $version ): void {
	$archive = new ZipArchive();

	if ( true !== $archive->open( $archive_path ) ) {
		throw new RuntimeException( 'Unable to open the generated release archive.' );
	}

	$expected = array_map(
		static fn( string $path ): string => RAN_ENHANCED_COVER_RELEASE_SLUG . '/' . $path,
		$files
	);
	$actual   = array();

	// phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase -- ZipArchive API property.
	for ( $index = 0; $index < $archive->numFiles; $index++ ) {
		$name = $archive->getNameIndex( $index );

		if ( false === $name ) {
			$archive->close();
			throw new RuntimeException( 'Unable to read an archive entry.' );
		}

		$actual[] = $name;
	}

	sort( $actual, SORT_STRING );

	if ( $expected !== $actual ) {
		$archive->close();
		throw new RuntimeException( 'Release archive contents do not match the approved runtime file list.' );
	}

	$plugin_file  = $archive->getFromName( RAN_ENHANCED_COVER_RELEASE_SLUG . '/ran-enhanced-cover.php' );
	$readme       = $archive->getFromName( RAN_ENHANCED_COVER_RELEASE_SLUG . '/readme.txt' );
	$pot          = $archive->getFromName( RAN_ENHANCED_COVER_RELEASE_SLUG . '/languages/ran-enhanced-cover.pot' );
	$source_block = $archive->getFromName( RAN_ENHANCED_COVER_RELEASE_SLUG . '/blocks/media/video-cover/block.json' );
	$build_block  = $archive->getFromName( RAN_ENHANCED_COVER_RELEASE_SLUG . '/build/blocks/media/video-cover/block.json' );
	$archive->close();

	if (
		false === $plugin_file ||
		false === $readme ||
		false === $pot ||
		false === $source_block ||
		false === $build_block ||
		! preg_match( '/^ \* Version:\s*' . preg_quote( $version, '/' ) . '\s*$/m', $plugin_file ) ||
		! str_contains( $plugin_file, "RAN_VIDEO_COVER_VERSION', '" . $version . "'" ) ||
		! preg_match( '/^Stable tag:\s*' . preg_quote( $version, '/' ) . '\s*$/mi', $readme ) ||
		! str_contains( $pot, 'Project-Id-Version: RAN Enhanced Cover ' . $version ) ||
		! preg_match( '/"version"\s*:\s*"' . preg_quote( $version, '/' ) . '"/', $source_block ) ||
		! preg_match( '/"version"\s*:\s*"' . preg_quote( $version, '/' ) . '"/', $build_block )
	) {
		throw new RuntimeException( 'Release archive version metadata does not match the expected version.' );
	}
}

/**
 * Run the release archive builder.
 *
 * @param array<int,string> $arguments Command arguments, including the script path.
 * @return int Process exit status.
 */
function ran_enhanced_cover_release_main( array $arguments ): int {
	$root       = dirname( __DIR__ );
	$arguments  = array_slice( $arguments, 1 );
	$check_only = in_array( '--check', $arguments, true );
	$output_path = null;

	try {
		if ( ! class_exists( 'ZipArchive' ) ) {
			throw new RuntimeException( 'The PHP ZipArchive extension is required to build release archives.' );
		}

		$version   = ran_enhanced_cover_release_plugin_version( $root );
		$allowlist = ran_enhanced_cover_release_allowlist( $root );
		$files     = ran_enhanced_cover_release_files( $root, $allowlist );
		ran_enhanced_cover_release_validate_versions( $root, $version );

		if ( empty( $files ) || ! in_array( 'build/blocks/media/video-cover/index.js', $files, true ) ) {
			throw new RuntimeException( 'Generated runtime block assets are required before building a release archive.' );
		}

		if ( $check_only ) {
			$output_path = tempnam( sys_get_temp_dir(), RAN_ENHANCED_COVER_RELEASE_SLUG . '-' );
		} else {
			$output_path = ran_enhanced_cover_release_output_path( $arguments, $root, $version );
		}

		if ( false === $output_path || '' === $output_path ) {
			throw new RuntimeException( 'Unable to create a release archive path.' );
		}

		$parent_directory = dirname( $output_path );
		if ( ! is_dir( $parent_directory ) && ! mkdir( $parent_directory, 0755, true ) && ! is_dir( $parent_directory ) ) {
			throw new RuntimeException( 'Unable to create the release archive directory.' );
		}

		$archive = new ZipArchive();
		if ( true !== $archive->open( $output_path, ZipArchive::CREATE | ZipArchive::OVERWRITE ) ) {
			throw new RuntimeException( 'Unable to create the release archive.' );
		}

		foreach ( $files as $file ) {
			$archive_path = RAN_ENHANCED_COVER_RELEASE_SLUG . '/' . $file;
			if (
				! $archive->addFile( $root . '/' . $file, $archive_path ) ||
				! $archive->setMtimeName( $archive_path, RAN_ENHANCED_COVER_RELEASE_MTIME ) ||
				! $archive->setExternalAttributesName( $archive_path, ZipArchive::OPSYS_UNIX, 0100644 << 16 )
			) {
				$archive->close();
				throw new RuntimeException( 'Unable to add a runtime file to the release archive: ' . $file );
			}
		}

		$archive->close();
		ran_enhanced_cover_release_validate_archive( $output_path, $files, $version );

		if ( $check_only ) {
			unlink( $output_path );
			fwrite( STDOUT, "Release archive validation passed.\n" );
			return 0;
		}

		fwrite( STDOUT, 'Created ' . $output_path . PHP_EOL );
		return 0;
	} catch ( Throwable $exception ) {
		if ( is_string( $output_path ) && is_file( $output_path ) && $check_only ) {
			unlink( $output_path );
		}

		fwrite( STDERR, $exception->getMessage() . PHP_EOL );
		return 1;
	}
}

if ( realpath( $argv[0] ) === __FILE__ ) {
	// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- This is a CLI process exit status.
	exit( ran_enhanced_cover_release_main( $argv ) );
}
