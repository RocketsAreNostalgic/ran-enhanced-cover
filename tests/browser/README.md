# Browser and accessibility smoke tests

Publish one fixture post containing a Video Cover block with a playable MP4 and
poster image, then run the suite against it in each target theme:

```sh
RAN_VIDEO_COVER_E2E_URL=http://example.test/video-cover-fixture/ pnpm test:browser
```

Run the command once with a block theme and once with a classic theme. The
smoke tests verify that the frontend has no `autoplay` markup, honours reduced
motion, remains paused without JavaScript, exposes a correctly named native
button, and preserves keyboard focus visibility. They deliberately use a
published URL rather than theme-specific selectors.
