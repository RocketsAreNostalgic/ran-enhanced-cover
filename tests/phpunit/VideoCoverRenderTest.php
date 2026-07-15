<?php
/**
 * Integration tests for the dynamic Video Cover renderer.
 *
 * @package RAN_Video_Cover
 */

namespace RAN\VideoCover\Tests;

use RAN\VideoCover\Blocks;

/**
 * Covers the motion-safe output and server-side attribute validation.
 */
class VideoCoverRenderTest extends \WP_UnitTestCase {
	/**
	 * Frontend runtime handle registered by the plugin.
	 *
	 * @var string
	 */
	private const RUNTIME_HANDLE = 'ran-video-cover-view';

	/**
	 * Ensure the dynamic block is registered even when the suite boots after init.
	 *
	 * @return void
	 */
	public function set_up() {
		parent::set_up();
		Blocks::register();
		wp_dequeue_script( self::RUNTIME_HANDLE );
	}

	/**
	 * Keep each render assertion independent of the previous block output.
	 *
	 * @return void
	 */
	public function tear_down() {
		wp_dequeue_script( self::RUNTIME_HANDLE );
		parent::tear_down();
	}

	/**
	 * Background videos must remain paused until the frontend script allows play.
	 *
	 * @return void
	 */
	public function test_video_markup_starts_paused_without_autoplay() {
		$rendered = do_blocks(
			'<!-- wp:ran/video-cover {"videoUrl":"https://example.com/video.mp4"} --><p>Example content</p><!-- /wp:ran/video-cover -->'
		);

		$this->assertStringContainsString( 'is-paused', $rendered );
		$this->assertStringContainsString( 'preload="metadata"', $rendered );
		$this->assertStringContainsString( '<source src="https://example.com/video.mp4" type="video/mp4">', $rendered );
		$this->assertStringContainsString( '>Play animation<', $rendered );
		$this->assertStringNotContainsString( ' autoplay', $rendered );
	}

	/**
	 * An existing block with one saved video URL remains a one-source video.
	 *
	 * @return void
	 */
	public function test_legacy_video_url_renders_a_single_video_source() {
		$rendered = do_blocks(
			'<!-- wp:ran/video-cover {"videoUrl":"https://example.com/legacy-video.mp4"} --><p>Example content</p><!-- /wp:ran/video-cover -->'
		);

		$this->assertSame( 1, substr_count( $rendered, '<source ' ) );
		$this->assertStringContainsString( '<source src="https://example.com/legacy-video.mp4" type="video/mp4">', $rendered );
		$this->assertTrue( wp_script_is( self::RUNTIME_HANDLE, 'enqueued' ) );
	}

	/**
	 * Alternative sources must be rendered in saved priority order so the browser
	 * can choose the first compatible file.
	 *
	 * @return void
	 */
	public function test_video_sources_render_ordered_source_tags_with_inferred_types() {
		$rendered = do_blocks(
			'<!-- wp:ran/video-cover {"videoSources":[{"id":101,"url":"https://example.com/animation-alpha.mp4"},{"id":102,"url":"https://example.com/animation-alpha.webm"},{"id":103,"url":"https://example.com/animation-fallback.mp4"}]} --><p>Example content</p><!-- /wp:ran/video-cover -->'
		);

		$first_mp4_source  = '<source src="https://example.com/animation-alpha.mp4" type="video/mp4">';
		$webm_source       = '<source src="https://example.com/animation-alpha.webm" type="video/webm">';
		$second_mp4_source = '<source src="https://example.com/animation-fallback.mp4" type="video/mp4">';

		$this->assertSame( 3, substr_count( $rendered, '<source ' ) );
		$this->assertStringContainsString( $first_mp4_source, $rendered );
		$this->assertStringContainsString( $webm_source, $rendered );
		$this->assertStringContainsString( $second_mp4_source, $rendered );
		$this->assertLessThan( strpos( $rendered, $webm_source ), strpos( $rendered, $first_mp4_source ) );
		$this->assertLessThan( strpos( $rendered, $second_mp4_source ), strpos( $rendered, $webm_source ) );
		$this->assertTrue( wp_script_is( self::RUNTIME_HANDLE, 'enqueued' ) );
	}

	/**
	 * Invalid serialized inset and position values must not reach inline CSS.
	 *
	 * @return void
	 */
	public function test_renderer_uses_safe_fallbacks_for_invalid_control_values() {
		$rendered = do_blocks(
			'<!-- wp:ran/video-cover {"videoUrl":"https://example.com/video.mp4","pauseControlPosition":"middle middle","pauseControlInsetBlock":"expression(alert(1))","pauseControlInsetInline":"var:preset|spacing|missing-scale"} --><p>Example content</p><!-- /wp:ran-video-cover -->'
		);

		$this->assertStringContainsString( '--ran-video-cover-toggle-block-end:1rem;', $rendered );
		$this->assertStringContainsString( '--ran-video-cover-toggle-inline-end:1rem;', $rendered );
		$this->assertStringNotContainsString( 'expression(', $rendered );
	}

	/**
	 * Saved blocks using the legacy palette slug must retain that explicit wash.
	 *
	 * @return void
	 */
	public function test_legacy_palette_overlay_is_not_overridden_by_the_default_custom_colour() {
		$rendered = do_blocks(
			'<!-- wp:ran/video-cover {"overlayColor":"brand-purple","overlayOpacity":80} --><p>Example content</p><!-- /wp:ran/video-cover -->'
		);

		$this->assertStringContainsString(
			'--ran-video-cover-wash:var(--wp--preset--color--brand-purple, #121212);',
			$rendered
		);
	}

	/**
	 * Surface background palette values must reach the renderer as safe theme variables.
	 *
	 * @return void
	 */
	public function test_renderer_exposes_named_surface_background_variable() {
		$rendered = do_blocks(
			'<!-- wp:ran/video-cover {"backgroundColor":"brand-purple"} --><p>Example content</p><!-- /wp:ran/video-cover -->'
		);

		$this->assertStringContainsString(
			'--ran-video-cover-background:var(--wp--preset--color--brand-purple, transparent);',
			$rendered
		);
	}

	/**
	 * Explicit custom backgrounds must remain available when no palette slug is set.
	 *
	 * @return void
	 */
	public function test_renderer_exposes_custom_surface_background_value() {
		$rendered = do_blocks(
			'<!-- wp:ran/video-cover {"customBackgroundColor":"#123456"} --><p>Example content</p><!-- /wp:ran/video-cover -->'
		);

		$this->assertStringContainsString(
			'--ran-video-cover-background:#123456;',
			$rendered
		);
	}

	/**
	 * An unset surface background must not invent an opaque panel colour.
	 *
	 * @return void
	 */
	public function test_renderer_uses_transparent_surface_background_fallback() {
		$rendered = do_blocks(
			'<!-- wp:ran/video-cover --><p>Example content</p><!-- /wp:ran/video-cover -->'
		);

		$this->assertStringContainsString(
			'--ran-video-cover-background:transparent;',
			$rendered
		);
	}

	/**
	 * Empty blocks do not need media controls or the browser playback runtime.
	 *
	 * @return void
	 */
	public function test_no_media_block_omits_media_toggle_and_runtime_handle() {
		$rendered = do_blocks(
			'<!-- wp:ran/video-cover {"videoSources":[],"pauseControl":true} --><p>Example content</p><!-- /wp:ran/video-cover -->'
		);

		$this->assertStringNotContainsString( 'ran-video-cover__media', $rendered );
		$this->assertStringNotContainsString( '<video ', $rendered );
		$this->assertStringNotContainsString( '<source ', $rendered );
		$this->assertStringNotContainsString( 'ran-video-cover__toggle', $rendered );
		$this->assertFalse( wp_script_is( self::RUNTIME_HANDLE, 'enqueued' ) );
	}

	/**
	 * A poster alone is static fallback media and must not load the playback runtime.
	 *
	 * @return void
	 */
	public function test_poster_only_block_omits_toggle_and_runtime_handle() {
		$rendered = do_blocks(
			'<!-- wp:ran/video-cover {"posterUrl":"https://example.com/poster.jpg","pauseControl":true} --><p>Example content</p><!-- /wp:ran/video-cover -->'
		);

		$this->assertStringContainsString( '<img class="ran-video-cover__media"', $rendered );
		$this->assertStringNotContainsString( '<video ', $rendered );
		$this->assertStringNotContainsString( 'ran-video-cover__toggle', $rendered );
		$this->assertFalse( wp_script_is( self::RUNTIME_HANDLE, 'enqueued' ) );
	}

	/**
	 * Video output requires both the visitor control and its conditional runtime.
	 *
	 * @return void
	 */
	public function test_video_block_enqueues_runtime_handle_and_renders_toggle() {
		$rendered = do_blocks(
			'<!-- wp:ran/video-cover {"videoUrl":"https://example.com/video.mp4","pauseControl":true} --><p>Example content</p><!-- /wp:ran/video-cover -->'
		);

		$this->assertStringContainsString( '<video class="ran-video-cover__media"', $rendered );
		$this->assertStringContainsString( 'ran-video-cover__toggle', $rendered );
		$this->assertStringContainsString( '>Play animation<', $rendered );
		$this->assertTrue( wp_script_is( self::RUNTIME_HANDLE, 'enqueued' ) );
	}
}
