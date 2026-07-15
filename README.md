# Ran Enhanced Cover

Ran Enhanced Cover is a standalone Cover-style WordPress block for background
video, a poster fallback, and a visitor-controlled motion preference. Its
canonical block name is `ran/enhanced-cover`.

## Features

-   Provides background video or poster-image media with focal point controls.
-   Supports content placement, minimum height, a transparent-media surface
    colour, an independent colour wash, and nested content.
-   Starts without autoplay and starts playback only when JavaScript confirms
    that the visitor has not requested reduced motion.
-   A visitor can pause all Video Cover blocks on a site. That non-identifying
    pause preference is stored in local storage when available; no cookie is set.

## Requirements

-   WordPress 6.5 or newer.
-   PHP 8.0 or newer.

## Installation

1. Install the plugin in `wp-content/plugins/ran-video-cover`.
2. Activate **Ran Enhanced Cover** in WordPress administration.
3. Deploy the committed `build/blocks/` runtime assets with the plugin.

The source `blocks/` directory is for development. WordPress loads the
compiled `build/blocks/` assets in production.

## Usage

Insert **Ran Enhanced Cover** from the standard **Media** category. Choose a background
video or poster image, then configure focal point, minimum height, content
placement, **Background colour**, and **Colour wash**. The selected background
colour sits beneath the media, so it is visible through transparent video or
poster pixels; the wash remains a separate layer. Add headings, body copy, and
buttons as nested content.

## Development

Run commands from this plugin directory:

```sh
pnpm install --frozen-lockfile
pnpm start
pnpm build
pnpm format:check
pnpm check
```

Source files live in `blocks/`. Rebuild `build/blocks/` after block changes and
commit the generated runtime assets with their source.

## Extensibility and compatibility

The block is not a migration adapter for arbitrary `core/cover` serialized
content. It owns its registration, assets, editor UI, rendering, and styles;
it depends only on WordPress APIs and standard `theme.json` presets.

Rendered markup uses `.ran-video-cover*` classes and
`--ran-video-cover-*` presentation variables. The frontend player is enqueued
only when a block has a selected video; poster-only and empty blocks keep their
shared presentation CSS without player JavaScript or controls. The frontend
stores an optional non-identifying pause preference under
`ranVideoCoverPaused` in local storage. It does not set or read cookies.

## Accessibility and security

Provide a useful poster image or first visible frame so content remains
understandable when video cannot play or JavaScript is unavailable. The block
honours reduced-motion preferences, exposes a native pause/play control, and
keeps the background video out of the accessibility tree. Use only media URLs
suitable for public delivery and preserve WordPress media-library permissions.

## Releases

The plugin directory contains a WordPress.org-compatible `readme.txt`, POT
template, clean archive allowlist, and SVN hand-off notes. Before a release:

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm check:build
composer install
composer lint
composer phpcs
pnpm pot
pnpm release
pnpm release:verify
pnpm release:plugin-check
```

`composer test` runs WordPress integration tests when `WP_TESTS_DIR` points to
an installed WordPress test library. See `tests/README.md` for setup details.
`pnpm release:plugin-check` runs the official WordPress Plugin Check command
against the generated ZIP after Plugin Check has been installed in the target
WordPress environment.

## License

RAN Video Cover is licensed under the [GNU General Public License v2.0 or
later](LICENSE) (`GPL-2.0-or-later`).

## Support and contributing

Report reproducible issues at
[RocketsAreNostalgic/ran-video-cover](https://github.com/RocketsAreNostalgic/ran-video-cover/issues).
Include the relevant lint and build output with changes.
