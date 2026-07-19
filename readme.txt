=== RAN Enhanced Cover ===
Contributors: rocketsarenostalgic
Tags: block, video, cover, accessibility, reduced-motion
Requires at least: 6.5
Tested up to: 7.0
Requires PHP: 8.0
<!-- x-release-please-start-version -->
Stable tag: 1.1.0
<!-- x-release-please-end -->
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

An accessible Cover-style block with background video, a poster fallback, and visitor-controlled motion.

== Description ==

RAN Enhanced Cover adds the `ran/enhanced-cover` block to the Media category. It combines a background video or poster image with nested WordPress blocks, focal-point controls, a background surface colour, an independent colour wash, and a native pause/play button.

The block deliberately starts without autoplay in its HTML. Its small frontend script is loaded only for blocks with a selected video, and starts playback only when the visitor has not requested reduced motion. A visitor can pause every Video Cover block on the site; that preference is stored only in browser local storage when available. The plugin does not set or read cookies and does not send data to a third-party service.

== Installation ==

1. Upload the `ran-enhanced-cover` folder to `/wp-content/plugins/`, or install the plugin through the WordPress Plugins screen.
2. Activate RAN Enhanced Cover through the Plugins screen.
3. Insert RAN Enhanced Cover from the Media block category and select a video or poster image.

== Frequently Asked Questions ==

= Does the block need a particular theme? =

No. It uses scoped styles and WordPress block/theme APIs. If a theme does not define the selected colour or spacing preset, RAN Enhanced Cover uses a dark wash and safe inset fallback.

= Does it collect personal data or use a third-party service? =

No. The plugin has no external service integration. It optionally writes the non-identifying value `ranVideoCoverPaused` to the visitor's local storage after they pause a video.

= What happens for reduced-motion visitors or without JavaScript? =

The video remains paused. The poster image, or the first available video frame, remains visible behind the content.

== Changelog ==

= 1.0.0 =
* First public release.
* Adds motion-safe playback, portable block assets, validated positioning controls, and WordPress.org release metadata.

== Upgrade Notice ==

= 1.0.0 =
First public release of RAN Enhanced Cover.
