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
	 * Ensure the dynamic block is registered even when the suite boots after init.
	 *
	 * @return void
	 */
	public function set_up() {
		parent::set_up();
		Blocks::register();
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
		$this->assertStringContainsString( '>Play animation<', $rendered );
		$this->assertStringNotContainsString( ' autoplay', $rendered );
	}

	/**
	 * Invalid serialized inset and position values must not reach inline CSS.
	 *
	 * @return void
	 */
	public function test_renderer_uses_safe_fallbacks_for_invalid_control_values() {
		$rendered = do_blocks(
			'<!-- wp:ran/video-cover {"videoUrl":"https://example.com/video.mp4","pauseControlPosition":"middle middle","pauseControlInsetBlock":"expression(alert(1))","pauseControlInsetInline":"var:preset|spacing|40"} --><p>Example content</p><!-- /wp:ran/video-cover -->'
		);

		$this->assertStringContainsString( '--ran-video-cover-toggle-block-end:1rem;', $rendered );
		$this->assertStringContainsString( '--ran-video-cover-toggle-inline-end:var(--wp--preset--spacing--40);', $rendered );
		$this->assertStringNotContainsString( 'expression(', $rendered );
	}
}
