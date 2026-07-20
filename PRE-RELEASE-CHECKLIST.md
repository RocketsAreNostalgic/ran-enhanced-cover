# Pre-release checklist

Use this as the final outstanding-work list before publishing RAN Enhanced Cover to
WordPress.org. The release archive and CI scaffolding already exist; this list
tracks the remaining sign-off work that should be complete before a public
submission.

## Publish blockers

-   [ ] Confirm the WordPress.org plugin slug `ran-enhanced-cover`, contributor
        account, support ownership, and public repository links are final.
-   [ ] Confirm the committed directory artwork in `wordpress-org/assets/` is
        licence-cleared, project-owned, and approved for public directory use.
-   [ ] Add any required WordPress.org screenshots to `wordpress-org/assets/` and
        update `readme.txt` if screenshots are included in the directory listing.
        Current assets cover icons and banners only.
-   [ ] Review `readme.txt` against the current WordPress.org readme validator,
        including tags, external-service/privacy language, the current stable tag, and
        the declared `Tested up to` value.
-   [ ] Run the full local release gate from a clean worktree:

        ```sh
        pnpm install --frozen-lockfile
        composer install
        pnpm check
        pnpm build
        pnpm check:build
        composer lint
        composer phpcs
        pnpm pot
        pnpm release
        pnpm release:verify
        pnpm release:plugin-check
        ```

-   [ ] Run the WordPress integration suite with `WP_TESTS_DIR` configured, at
        minimum across the supported WordPress/PHP matrix represented in
        `.github/workflows/quality.yml`.
-   [ ] Run the browser smoke test in `tests/browser/` against a clean WordPress
        install and capture pass/fail notes for the release record.
-   [ ] Install the generated ZIP into a fresh WordPress site and verify block
        insertion, saved markup, frontend playback, reduced-motion behaviour,
        poster fallback, and pause/play persistence.
-   [ ] Confirm the release ZIP contains the built `build/blocks/` runtime assets
        and excludes development-only files.
-   [ ] Submit the reviewed ZIP manually and wait for WordPress.org approval and
        the assigned slug before configuring the protected deployment contract.
-   [ ] Follow `wordpress-org/DEPLOYMENT.md` for the first reviewer-approved
        deployment, then verify SVN `trunk`, the matching version tag, `/assets`,
        the directory page, and the installation/update path.

## Translation readiness

-   [ ] Confirm all user-facing PHP and JavaScript strings are wrapped in the
        appropriate WordPress i18n function with the `ran-enhanced-cover` text
        domain. Block metadata strings in `block.json` are covered by its
        `textdomain` value and the POT extraction command.
-   [ ] Run the WordPress i18n coding-standard sniff:
        `composer run phpcs -- --sniffs=WordPress.WP.I18n`.
-   [ ] Regenerate `languages/ran-enhanced-cover.pot` with `pnpm pot` after all
        final user-facing copy changes.
-   [ ] Confirm the POT file has no stale source references and is committed with
        the release.
-   [ ] Do not bundle `.po` or `.mo` files unless they are reviewed,
        release-ready translations. WordPress.org translations should normally be
        handled through translate.wordpress.org after approval.
-   [ ] Treat launch translations as optional. Only add `.po` and `.mo` files if
        a fluent reviewer has approved them and there is a specific release reason
        to ship them before WordPress.org language packs exist.

## Nice-to-have before first public launch

-   [ ] Capture a short manual QA note covering common themes and at least one
        no-JavaScript or JavaScript-failure scenario.
-   [ ] Re-check accessibility copy for the pause/play control and poster guidance
        after any final editor-label changes.
