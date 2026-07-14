<?php
/**
 * Render callback for ran/video-cover.
 *
 * @package RAN_Video_Cover
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$defaults   = array(
	'videoUrl'                => '',
	'posterUrl'               => '',
	'focalPoint'              => array(
		'x' => 0.5,
		'y' => 0.5,
	),
	'minHeight'               => 80,
	'minHeightUnit'           => 'vh',
	'contentPosition'         => 'center left',
	'backgroundColor'         => '',
	'customBackgroundColor'   => '',
	'overlayColor'            => '',
	'customOverlayColor'      => '',
	'overlayOpacity'          => 70,
	'pauseControl'            => true,
	'pauseControlPosition'    => 'bottom right',
	'pauseControlInsetBlock'  => '1rem',
	'pauseControlInsetInline' => '1rem',
);
$attributes = wp_parse_args( $attributes, $defaults );

/**
 * Keep generated CSS custom-property values to a small, intentional grammar.
 *
 * This accepts persisted block values from the unit-aware editor controls plus
 * WordPress spacing-preset variables. All other values use the safe default.
 *
 * @param mixed $value Candidate inset value.
 * @return string
 */
$sanitize_inset = static function ( $value ) {
	if ( ! is_string( $value ) && ! is_numeric( $value ) ) {
		return '1rem';
	}

	$value = strtolower( trim( (string) $value ) );

	if ( '0' === $value ) {
		return '0';
	}

	if ( preg_match( '/^var:preset\|spacing\|([a-z0-9-]+)$/', $value, $matches ) ) {
		return 'var(--wp--preset--spacing--' . $matches[1] . ')';
	}

	if ( preg_match( '/^var\(--wp--preset--spacing--[a-z0-9-]+\)$/', $value ) ) {
		return $value;
	}

	if ( preg_match( '/^[-+]?(?:\d+|\d*\.\d+)(?:px|rem|em|%|vw|vh)$/', $value ) ) {
		return $value;
	}

	return '1rem';
};

$allowed_content_positions = array(
	'top left',
	'top center',
	'top right',
	'center left',
	'center center',
	'center right',
	'bottom left',
	'bottom center',
	'bottom right',
);
$content_position          = in_array( $attributes['contentPosition'], $allowed_content_positions, true ) ? $attributes['contentPosition'] : 'center left';
$position_class            = 'is-position-' . preg_replace( '/\s+/', '-', $content_position );

$focal_point = is_array( $attributes['focalPoint'] ) ? $attributes['focalPoint'] : $defaults['focalPoint'];
$focal_x     = isset( $focal_point['x'] ) ? (float) $focal_point['x'] : 0.5;
$focal_y     = isset( $focal_point['y'] ) ? (float) $focal_point['y'] : 0.5;
$focal_x     = min( 1, max( 0, $focal_x ) );
$focal_y     = min( 1, max( 0, $focal_y ) );

$min_height       = isset( $attributes['minHeight'] ) ? (float) $attributes['minHeight'] : 80;
$min_height_units = array( 'vh', '%', 'px', 'rem' );
$min_height_unit  = in_array( $attributes['minHeightUnit'], $min_height_units, true ) ? $attributes['minHeightUnit'] : 'vh';

$overlay_opacity = isset( $attributes['overlayOpacity'] ) ? (int) $attributes['overlayOpacity'] : 70;
$overlay_opacity = min( 100, max( 0, $overlay_opacity ) );

$background_value = ! empty( $attributes['customBackgroundColor'] ) ? sanitize_hex_color( $attributes['customBackgroundColor'] ) : '';

if ( ! $background_value && ! empty( $attributes['backgroundColor'] ) ) {
	$background_slug  = sanitize_title( $attributes['backgroundColor'] );
	$background_value = $background_slug ? 'var(--wp--preset--color--' . $background_slug . ', transparent)' : '';
}

if ( ! $background_value ) {
	$background_value = 'transparent';
}

if ( ! empty( $attributes['customOverlayColor'] ) ) {
	$overlay_value = sanitize_hex_color( $attributes['customOverlayColor'] );
} elseif ( ! empty( $attributes['overlayColor'] ) ) {
	$overlay_slug  = sanitize_title( $attributes['overlayColor'] );
	$overlay_value = 'var(--wp--preset--color--' . $overlay_slug . ', #121212)';
} else {
	$overlay_value = '#121212';
}

if ( empty( $overlay_value ) ) {
	$overlay_value = '#121212';
}

$block_inset       = $sanitize_inset( $attributes['pauseControlInsetBlock'] ?? '1rem' );
$inline_inset      = $sanitize_inset( $attributes['pauseControlInsetInline'] ?? '1rem' );
$control_positions = array(
	'top left',
	'top center',
	'top right',
	'bottom left',
	'bottom center',
	'bottom right',
);
$control_position  = in_array( $attributes['pauseControlPosition'], $control_positions, true ) ? $attributes['pauseControlPosition'] : 'bottom right';

$toggle_block_start  = 'auto';
$toggle_block_end    = 'auto';
$toggle_inline_start = 'auto';
$toggle_inline_end   = 'auto';
$toggle_transform    = 'none';

if ( str_contains( $control_position, 'top' ) ) {
	$toggle_block_start = $block_inset;
} else {
	$toggle_block_end = $block_inset;
}

if ( str_contains( $control_position, 'left' ) ) {
	$toggle_inline_start = $inline_inset;
} elseif ( str_contains( $control_position, 'center' ) ) {
	$toggle_inline_start = '50%';
	$toggle_transform    = 'translateX(-50%)';
} else {
	$toggle_inline_end = $inline_inset;
}

$style = sprintf(
	'--ran-video-cover-min-height:%1$s%2$s;--ran-video-cover-focal-x:%3$s%%;--ran-video-cover-focal-y:%4$s%%;--ran-video-cover-wash:%5$s;--ran-video-cover-wash-opacity:%6$s;--ran-video-cover-toggle-block-start:%7$s;--ran-video-cover-toggle-block-end:%8$s;--ran-video-cover-toggle-inline-start:%9$s;--ran-video-cover-toggle-inline-end:%10$s;--ran-video-cover-toggle-transform:%11$s;--ran-video-cover-background:%12$s;',
	esc_attr( $min_height ),
	esc_attr( $min_height_unit ),
	esc_attr( $focal_x * 100 ),
	esc_attr( $focal_y * 100 ),
	esc_attr( $overlay_value ),
	esc_attr( $overlay_opacity / 100 ),
	esc_attr( $toggle_block_start ),
	esc_attr( $toggle_block_end ),
	esc_attr( $toggle_inline_start ),
	esc_attr( $toggle_inline_end ),
	esc_attr( $toggle_transform ),
	esc_attr( $background_value )
);

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => implode(
			' ',
			array(
				'ran-video-cover',
				'has-custom-content-position',
				'is-paused',
				$position_class,
			)
		),
		'style' => $style,
	)
);

$video_url       = ! empty( $attributes['videoUrl'] ) ? esc_url( $attributes['videoUrl'] ) : '';
$poster_url      = ! empty( $attributes['posterUrl'] ) ? esc_url( $attributes['posterUrl'] ) : '';
$object_position = esc_attr( ( $focal_x * 100 ) . '% ' . ( $focal_y * 100 ) . '%' );

if ( $video_url ) {
	wp_enqueue_script( \RAN\VideoCover\Blocks::VIEW_SCRIPT_HANDLE );
}

echo '<section ' . $wrapper_attributes . '>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Generated by WordPress plus escaped local values.

if ( $video_url ) {
	printf(
		'<video class="ran-video-cover__media" muted loop playsinline preload="metadata" aria-hidden="true" src="%1$s"%2$s style="object-position:%3$s"></video>',
		esc_url( $video_url ),
		$poster_url ? ' poster="' . esc_url( $poster_url ) . '"' : '',
		esc_attr( $object_position )
	);
} elseif ( $poster_url ) {
	printf(
		'<img class="ran-video-cover__media" src="%1$s" alt="" style="object-position:%2$s">',
		esc_url( $poster_url ),
		esc_attr( $object_position )
	);
}

echo '<span class="ran-video-cover__wash" aria-hidden="true"></span>';
echo '<div class="ran-video-cover__content">' . $content . '</div>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Inner block content is rendered by WordPress blocks.

if ( $video_url && ! empty( $attributes['pauseControl'] ) ) {
	printf(
		'<button class="ran-video-cover__toggle" type="button" aria-label="%1$s" data-play-label="%1$s" data-pause-label="%2$s"><span class="ran-video-cover__toggle-label">%1$s</span></button>',
		esc_attr__( 'Play animation', 'ran-video-cover' ),
		esc_attr__( 'Pause animation', 'ran-video-cover' )
	);
}

echo '</section>';
