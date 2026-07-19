<?php
/**
 * Plugin Name: RAN Enhanced Cover
 * Plugin URI: https://github.com/RocketsAreNostalgic/ran-enhanced-cover
 * Description: An enhanced Cover-style block with background video, a poster fallback, and motion-sensitive pause/play controls.
 * x-release-please-start-version
 * Version: 1.1.1
 * x-release-please-end
 * Author: RAN
 * Author URI: https://github.com/RocketsAreNostalgic/
 * Text Domain: ran-enhanced-cover
 * Domain Path: /languages
 * Requires at least: 6.5
 * Requires PHP: 8.0
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 *
 * @package RAN_Video_Cover
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// phpcs:ignore Squiz.Commenting.InlineComment.InvalidEndChar -- Release Please marker.
define( 'RAN_VIDEO_COVER_VERSION', '1.1.1' ); // x-release-please-version
define( 'RAN_VIDEO_COVER_PLUGIN_FILE', __FILE__ );
define( 'RAN_VIDEO_COVER_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'RAN_VIDEO_COVER_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

require_once RAN_VIDEO_COVER_PLUGIN_DIR . 'includes/Blocks.php';

add_action( 'init', array( \RAN\VideoCover\Blocks::class, 'register' ) );
add_action( 'admin_notices', array( \RAN\VideoCover\Blocks::class, 'display_build_notice' ) );
