<?php
/**
 * Plugin Name: RAN Video Cover
 * Plugin URI: https://github.com/RocketsAreNostalgic/ran-video-cover
 * Description: A Cover-style block with background video, a poster fallback, and motion-sensitive pause/play controls.
 * Version: 0.1.0
 * Author: RAN
 * Author URI: https://github.com/RocketsAreNostalgic/
 * Text Domain: ran-video-cover
 * Requires at least: 6.5
 * Requires PHP: 7.4
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 *
 * @package RAN_Video_Cover
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'RAN_VIDEO_COVER_VERSION', '0.1.0' );
define( 'RAN_VIDEO_COVER_PLUGIN_FILE', __FILE__ );
define( 'RAN_VIDEO_COVER_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'RAN_VIDEO_COVER_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

require_once RAN_VIDEO_COVER_PLUGIN_DIR . 'includes/Assets.php';
require_once RAN_VIDEO_COVER_PLUGIN_DIR . 'includes/Blocks.php';

add_action( 'init', array( \RAN\VideoCover\Blocks::class, 'register' ) );
add_action( 'init', array( \RAN\VideoCover\Assets::class, 'register' ) );
