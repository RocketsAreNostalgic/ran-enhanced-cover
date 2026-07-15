# WordPress integration tests

The PHP tests use the official WordPress PHPUnit library rather than a mocked
renderer. Install a matching WordPress test environment, then point
`WP_TESTS_DIR` at its test library:

```sh
export WP_TESTS_DIR=/tmp/wordpress-tests-lib
composer install
composer test
```

The test library must contain `includes/functions.php` and a WordPress test
database configured by the standard WordPress test bootstrap. The GitHub
Actions workflow provisions the database and test library for WordPress 6.5 on
PHP 8.0 and the current WordPress release on the current supported PHP.

## Browser fixtures

The Playwright checks are opt-in because this standalone plugin does not own a
published WordPress fixture. Supply these URLs when running `pnpm test:browser`:

```sh
export RAN_ENHANCED_COVER_E2E_URL=https://example.test/video-cover-video/
export RAN_ENHANCED_COVER_STATIC_E2E_URL=https://example.test/video-cover-poster-only/
export RAN_ENHANCED_COVER_SURFACE_E2E_URL=https://example.test/video-cover-transparent-surface/
pnpm test:browser
```

The video fixture must contain a Video Cover with a selected video. The static
fixture must contain an empty or poster-only Video Cover. The surface fixture
must contain a Video Cover with `backgroundColor` set to `brand-purple`; it is
used to verify that the independently configured surface remains beneath the
media and wash. Each fixture test is skipped unless its corresponding URL is
provided.
