<?php
/**
 * Bootstrap the WordPress integration test suite.
 *
 * @package RAN_Video_Cover
 */

$_tests_dir = getenv( 'WP_TESTS_DIR' );

if ( ! $_tests_dir ) {
	$_tests_dir = '/tmp/wordpress-tests-lib';
}

if ( ! file_exists( $_tests_dir . '/includes/functions.php' ) ) {
	echo 'Missing WordPress test library. Set WP_TESTS_DIR before running composer test.' . PHP_EOL;
	exit( 1 );
}

require_once $_tests_dir . '/includes/functions.php';

tests_add_filter(
	'muplugins_loaded',
	static function () {
		require dirname( __DIR__ ) . '/ran-video-cover.php';
	}
);

require $_tests_dir . '/includes/bootstrap.php';
