# WordPress integration tests

The PHP tests use the official WordPress PHPUnit library rather than a mocked
renderer. Install a matching WordPress test environment, then point
`WP_TESTS_DIR` at its test library:

```sh
export WP_TESTS_DIR=/tmp/wordpress-tests-lib
composer install
composer test:integration
```

The test library must contain `includes/functions.php` and a WordPress test
database configured by the standard WordPress test bootstrap. The GitHub
Actions workflow provisions the database and test library for WordPress 6.5 on
PHP 8.0 and WordPress 7.1.3 on PHP 8.5. Both ordinary source changes and main
pushes exercise these endpoints; recognized Release Please candidates retain the
bounded WordPress 7.1.3 / PHP 8.5 lane. The upper WordPress target is explicit so
the PHPUnit library and fresh ZIP installation use the same released version,
rather than combining the latest stable core with the development test library.

The canonical archive is built once and shared by both installed lanes. Existing
PHP 8.3 tooling jobs remain unchanged; replacing the runtime endpoint adds no
frontend, static-analysis or build repetition. Ordinary PR and dispatch runs
retain shared-baseline and specialist source checks; their existing overlapping
work remains a separate CI-efficiency audit item. PHP 8.1–8.4 are within the
declared support range but are not established by these endpoint runs alone. Browser and
manual release acceptance remain separate checks.

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
