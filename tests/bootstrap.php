<?php
/**
 * Bootstrap the WordPress integration test suite.
 *
 * @package RAN_Video_Cover
 */

$_tests_dir = getenv( 'WP_TESTS_DIR' );
$autoload   = dirname( __DIR__ ) . '/vendor/autoload.php';

if ( ! $_tests_dir ) {
	$_tests_dir = '/tmp/wordpress-tests-lib';
}

if ( ! file_exists( $_tests_dir . '/includes/functions.php' ) ) {
	echo 'Missing WordPress test library. Set WP_TESTS_DIR before running composer test.' . PHP_EOL;
	exit( 1 );
}

if ( file_exists( $autoload ) ) {
	require_once $autoload;
}

if ( ! defined( 'WP_TESTS_PHPUNIT_POLYFILLS_PATH' ) ) {
	define( 'WP_TESTS_PHPUNIT_POLYFILLS_PATH', dirname( __DIR__ ) . '/vendor/yoast/phpunit-polyfills' );
}

require_once $_tests_dir . '/includes/functions.php';

tests_add_filter(
	'muplugins_loaded',
	static function () {
		require dirname( __DIR__ ) . '/ran-enhanced-cover.php';
	}
);

require $_tests_dir . '/includes/bootstrap.php';
