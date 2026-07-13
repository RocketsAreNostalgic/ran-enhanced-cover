<?php
/**
 * Block registration for RAN Video Cover.
 *
 * @package RAN_Video_Cover
 */

namespace RAN\VideoCover;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the committed compiled block metadata.
 */
final class Blocks {
	/**
	 * Relative paths required by the metadata registered at runtime.
	 *
	 * Source files are intentionally not a production fallback: they contain
	 * unbundled imports and do not include the generated stylesheet assets.
	 *
	 * @var string[]
	 */
	private const REQUIRED_BUILD_FILES = array(
		'block.json',
		'index.js',
		'index.asset.php',
		'index.css',
		'style-index.css',
		'view.js',
		'view.asset.php',
		'render.php',
	);

	/**
	 * Register all block metadata directories.
	 *
	 * @return void
	 */
	public static function register() {
		if ( ! function_exists( 'register_block_type' ) ) {
			return;
		}

		if ( ! self::build_is_complete() ) {
			return;
		}

		if ( \WP_Block_Type_Registry::get_instance()->is_registered( 'ran/video-cover' ) ) {
			return;
		}

		register_block_type( self::block_directory() );
	}

	/**
	 * Show administrators an actionable recovery message when release assets are absent.
	 *
	 * @return void
	 */
	public static function display_build_notice() {
		if ( ! is_admin() || ! current_user_can( 'activate_plugins' ) || self::build_is_complete() ) {
			return;
		}

		$missing_files = implode( ', ', self::missing_build_files() );
		$message       = sprintf(
			/* translators: %s: comma-separated generated asset paths. */
			__( 'RAN Video Cover could not register because its compiled build assets are missing: %s. Reinstall the release ZIP or rebuild the plugin with <code>pnpm build</code>.', 'ran-video-cover' ),
			$missing_files
		);

		printf( '<div class="notice notice-error"><p>%s</p></div>', wp_kses_post( $message ) );
	}

	/**
	 * Determine whether every metadata-referenced runtime asset is present.
	 *
	 * @return bool
	 */
	private static function build_is_complete() {
		return array() === self::missing_build_files();
	}

	/**
	 * Return the generated files that are missing from the release.
	 *
	 * @return string[]
	 */
	private static function missing_build_files() {
		$block_directory = self::block_directory();
		$missing_files   = array();

		foreach ( self::REQUIRED_BUILD_FILES as $file ) {
			if ( ! is_readable( $block_directory . '/' . $file ) ) {
				$missing_files[] = 'build/blocks/media/video-cover/' . $file;
			}
		}

		return $missing_files;
	}

	/**
	 * Return the only runtime block directory.
	 *
	 * @return string
	 */
	private static function block_directory() {
		return RAN_VIDEO_COVER_PLUGIN_DIR . 'build/blocks/media/video-cover';
	}
}
