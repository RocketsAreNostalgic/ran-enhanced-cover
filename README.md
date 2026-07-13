# RAN Video Cover

RAN Video Cover is a standalone Cover-style WordPress block for background
video, a poster fallback, and a visitor-controlled motion preference. Its
canonical block name is `ran/video-cover`.

## Features

- Provides background video or poster-image media with focal point controls.
- Supports content placement, minimum height, colour wash, and nested content.
- Stores a site-wide pause/play preference for each visitor.
- Starts paused for `prefers-reduced-motion: reduce` unless a visitor chooses
  to play the video.

## Requirements

- WordPress 6.5 or newer.
- PHP 7.4 or newer.

## Installation

1. Install the plugin in `wp-content/plugins/ran-video-cover`.
2. Activate **RAN Video Cover** in WordPress administration.
3. Deploy the committed `build/blocks/` runtime assets with the plugin.

The source `blocks/` directory is for development. WordPress loads the
compiled `build/blocks/` assets in production.

## Usage

Insert **Video Cover** from the `PNS Blocks` category. Choose a background
video or poster image, then configure focal point, minimum height, content
placement, and colour wash. Add headings, body copy, and buttons as nested
content.

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
`--ran-video-cover-*` presentation variables. The frontend stores a visitor's
motion preference under `ranVideoCoverMotion`.

## Accessibility and security

Provide a useful poster image or first visible frame so content remains
understandable when video cannot play. The block honours reduced-motion
preferences and exposes pause/play control. Use only media URLs suitable for
public delivery and preserve WordPress media-library permissions.

## License

RAN Video Cover is licensed under the [GNU General Public License v2.0 or
later](LICENSE) (`GPL-2.0-or-later`).

## Support and contributing

Report reproducible issues at
[RocketsAreNostalgic/ran-video-cover](https://github.com/RocketsAreNostalgic/ran-video-cover/issues).
Include the relevant lint and build output with changes.
