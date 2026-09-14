# AGENTS.md

## Project contract

This is the standalone RAN Enhanced Cover WordPress plugin repository inside a
larger local WordPress installation. Work in this directory unless the task
explicitly concerns the parent site.

The supported baseline is WordPress 6.5+ and PHP 8.0+. Keep the plugin header,
`composer.json`, PHPCS configuration, CI, and documentation aligned whenever
that compatibility contract changes. Do not raise that baseline as part of
tooling or workflow work.

## Dex: plans and execution record

Use Dex for non-trivial plans and implementation work. Its local state is
private and ignored by Git.

```sh
dex --storage-path .dex status
dex --storage-path .dex create "Short outcome" --description "Scope, acceptance criteria, and checks"
dex --storage-path .dex start <id>
dex --storage-path .dex complete <id> --result "What changed and how it was verified" --commit <sha>
```

- Use one parent task per meaningful outcome and child tasks for independently
  verifiable slices.
- Record decisions, validation, and follow-up work in the Dex task result.
- Do not commit, copy, delete, or externally sync `.dex` without explicit
  direction.
- Keep durable project decisions in tracked Markdown documentation; Dex is the
  working plan and execution ledger, not published project history.

## WordPress skills

The project-scoped WordPress skills live in `.codex/skills/`. Read the relevant
`SKILL.md` before working in its area:

- `wordpress-router` and `wp-project-triage` for initial orientation.
- `wp-plugin-development` for plugin structure, hooks, settings, security,
  and WordPress conventions.
- `wp-wpcli-and-ops` for WP-CLI or operational changes.
- `wp-phpstan` when adding or changing static analysis.

## Development workflow

Install from the tracked locks; never use a setup script that deletes them.

```sh
composer install --no-interaction
pnpm install --frozen-lockfile
pnpm check
pnpm lint:php
pnpm check:generated
pnpm test:php
pnpm release:verify
pnpm release:plugin-check
```

Source block assets live in `blocks/` and compiled runtime assets in
`build/blocks/` are committed. Run `pnpm build` and `pnpm i18n:pot` for
relevant source changes, then review and stage the generated build assets and
`languages/ran-enhanced-cover.pot`. The pre-commit hook enforces those checks
for its configured source paths; tooling, documentation, and release-only
changes must not cause an unnecessary rebuild.

## Quality profile and ownership

This repository uses the RAN `wordpress-plugin` quality profile.

- `ran/coding-standards` owns the organisation-wide PHP, WordPress Coding
  Standards, and PHPCompatibility ancestry. This repository continues to own
  its WordPress 6.5+ / PHP 8.0+ support range, source paths, text domain, and
  justified PHPCS exceptions.
- `@rocketsarenostalgic/quality-config` owns the shared ESLint, Prettier, and
  Stylelint ancestry. This repository continues to own source selection,
  generated/vendor exclusions, CommonJS/Node globals, WordPress external
  module declarations, and product-specific exceptions including
  `@wordpress/no-unsafe-wp-apis` and the block metadata Prettier override.
- `composer check` is the deterministic PHPCS source-quality contract for the
  shared baseline. PHP syntax linting and WordPress integration PHPUnit remain
  repository-owned gates.
- `pnpm check` remains the deterministic package-level quality contract.
- Canonical release-archive creation and verification, generated block/POT
  drift, the WordPress compatibility matrix, fresh-ZIP install/activation,
  release-workflow contract checks, and Plugin Check remain repository-owned
  specialist gates. Shared quality adoption must not remove or weaken them.

## Git and commits

Use Conventional Commits with one coherent change per commit. `feat:` and
`fix:` are releasable; use `chore:`, `docs:`, `test:`, `build:`, or `ci:` for
non-release work. Do not commit `vendor/`, `node_modules/`, `.dex`, test
caches, editor-local files, or generated artifacts outside the tracked build
assets and POT.

## Release automation

Use the global `$release-please` skill before configuring, changing, or
operating this repository's release workflow.

This is a standalone GitHub repository. Release Please should run from `main`
with a manifest-driven PHP release configuration. The WordPress plugin header
and runtime constant in `ran-enhanced-cover.php`, `readme.txt` stable tag,
`package.json`, tracked POT project version, source and checked-in build
`block.json` metadata, and generated `CHANGELOG.md` must agree with the
release version. The normal PHP strategy does not update those
WordPress-specific sources automatically; configure and test explicit
extra-file updates.

The quality workflow and release scripts derive archive names from the plugin
metadata and verify the resulting archive. Keep packaging or WordPress.org
deployment separate from Release Please.

Treat the existing initial-release preparation commit as the bootstrap
boundary, preserve version `1.0.0` in the initial manifest, and review the
first generated release PR before merging it.

## External AI agent prohibition

Do not invoke, delegate work to, tag, enable, or otherwise use Blacksmith [code]smith,
`@codesmith-bot`, Blacksmith Autofix, Blacksmith CI Tuning, Blacksmith Testbox agents,
or any other Blacksmith AI/agent feature.

Blacksmith may be used only as infrastructure for ordinary GitHub Actions runners where
the repository workflow explicitly specifies a Blacksmith runner.

Do not click or trigger "Enable autofix", do not ask [code]smith to investigate or repair
CI, and do not call Blacksmith agent/MCP/CLI/API features that perform AI inference.

If CI fails, inspect GitHub Actions logs directly and diagnose/fix the failure yourself.

This prohibition is a cost-control requirement and must not be overridden by convenience,
CI failure, review comments, or suggestions from GitHub/Blacksmith UI.
