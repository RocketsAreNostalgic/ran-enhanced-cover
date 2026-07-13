<?php
/**
 * One-time direct migration from pns/video-banner to ran/video-cover.
 *
 * Run a dry check first:
 * wp eval-file scripts/migrate-video-cover-blocks.php
 *
 * Apply the migration:
 * RAN_VIDEO_COVER_APPLY=1 wp eval-file scripts/migrate-video-cover-blocks.php
 *
 * @package RAN_Video_Cover
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

global $wpdb;

$old_block = 'pns/video-banner';
$new_block = 'ran/video-cover';
$apply     = '1' === getenv( 'RAN_VIDEO_COVER_APPLY' );
$rows      = $wpdb->get_results(
	$wpdb->prepare(
		"SELECT ID, post_content FROM {$wpdb->posts} WHERE post_content LIKE %s ORDER BY ID",
		'%' . $wpdb->esc_like( $old_block ) . '%'
	)
);

foreach ( $rows as $row ) {
	$updated_content = str_replace(
		array(
			'<!-- wp:' . $old_block,
			'<!-- /wp:' . $old_block . ' -->',
		),
		array(
			'<!-- wp:' . $new_block,
			'<!-- /wp:' . $new_block . ' -->',
		),
		$row->post_content
	);

	if ( $apply && $updated_content !== $row->post_content ) {
		$wpdb->update(
			$wpdb->posts,
			array( 'post_content' => $updated_content ),
			array( 'ID' => $row->ID ),
			array( '%s' ),
			array( '%d' )
		);
		clean_post_cache( $row->ID );
	}

	WP_CLI::line( ( $apply ? 'Migrated ' : 'Would migrate ' ) . 'post ' . $row->ID . '.' );
}

WP_CLI::success(
	$apply
		? sprintf( 'Migrated %d post records from %s to %s.', count( $rows ), $old_block, $new_block )
		: sprintf( 'Found %d post records. Re-run with RAN_VIDEO_COVER_APPLY=1 to migrate them.', count( $rows ) )
);
